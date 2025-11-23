import pytesseract
from PIL import Image
import cv2
import numpy as np
from pdf2image import convert_from_path, convert_from_bytes
import re
import json
from typing import List, Optional, Tuple
import asyncio
from anthropic import AsyncAnthropic
import openai
from ..core.config import settings
from ..schemas.schemas import OCRResult, QuoteItemCreate
import logging

logger = logging.getLogger(__name__)


class OCRService:
    """
    Pipeline OCR ibrida:
    1. Preprocessing immagine (OpenCV)
    2. Tesseract per estrazione base
    3. LLM per strutturazione e correzione
    """
    
    def __init__(self):
        pytesseract.pytesseract.tesseract_cmd = settings.TESSERACT_CMD
        self.anthropic = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY) if settings.ANTHROPIC_API_KEY else None
        
    async def process_document(self, file_bytes: bytes, filename: str) -> OCRResult:
        """Processa un documento (PDF o immagine) ed estrae i dati"""
        
        # 1. Converti in immagini
        images = await self._convert_to_images(file_bytes, filename)
        
        # 2. Preprocessing e OCR per ogni pagina
        all_text = []
        total_confidence = 0
        
        for img in images:
            processed = self._preprocess_image(img)
            text, confidence = self._extract_text(processed)
            all_text.append(text)
            total_confidence += confidence
        
        raw_text = "\n\n--- PAGE BREAK ---\n\n".join(all_text)
        avg_confidence = total_confidence / len(images) if images else 0
        
        # 3. LLM per strutturazione dati
        if self.anthropic and avg_confidence < 0.95:
            extracted = await self._extract_with_llm(raw_text)
        else:
            extracted = self._extract_with_regex(raw_text)
        
        return OCRResult(
            raw_text=raw_text,
            confidence=avg_confidence,
            extracted_items=extracted["items"],
            supplier_info=extracted.get("supplier"),
            total_amount=extracted.get("total"),
            quote_date=extracted.get("date")
        )
    
    async def _convert_to_images(self, file_bytes: bytes, filename: str) -> List[np.ndarray]:
        """Converte PDF o immagine in lista di immagini numpy"""
        
        if filename.lower().endswith('.pdf'):
            # PDF to images
            pil_images = convert_from_bytes(file_bytes, dpi=300)
            return [np.array(img) for img in pil_images]
        else:
            # Single image
            nparr = np.frombuffer(file_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return [img] if img is not None else []
    
    def _preprocess_image(self, image: np.ndarray) -> np.ndarray:
        """
        Preprocessing per migliorare OCR accuracy:
        - Grayscale
        - Denoising
        - Binarization adattiva
        - Deskew
        """
        # Grayscale
        if len(image.shape) == 3:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image
        
        # Denoise
        denoised = cv2.fastNlMeansDenoising(gray, h=10)
        
        # Adaptive thresholding (binarization)
        binary = cv2.adaptiveThreshold(
            denoised, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 11, 2
        )
        
        # Deskew
        coords = np.column_stack(np.where(binary > 0))
        if len(coords) > 0:
            angle = cv2.minAreaRect(coords)[-1]
            if angle < -45:
                angle = 90 + angle
            if abs(angle) > 0.5:
                (h, w) = binary.shape[:2]
                center = (w // 2, h // 2)
                M = cv2.getRotationMatrix2D(center, angle, 1.0)
                binary = cv2.warpAffine(binary, M, (w, h),
                    flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
        
        return binary
    
    def _extract_text(self, image: np.ndarray) -> Tuple[str, float]:
        """Estrae testo con Tesseract e restituisce confidence"""
        
        # Config per italiano + layout tabellare
        config = '--oem 3 --psm 6 -l ita+eng'
        
        # Estrai con dati dettagliati
        data = pytesseract.image_to_data(image, config=config, output_type=pytesseract.Output.DICT)
        
        # Calcola confidence media
        confidences = [int(c) for c in data['conf'] if int(c) > 0]
        avg_conf = sum(confidences) / len(confidences) / 100 if confidences else 0
        
        # Estrai testo
        text = pytesseract.image_to_string(image, config=config)
        
        return text.strip(), avg_conf
    
    async def _extract_with_llm(self, raw_text: str) -> dict:
        """Usa Claude per estrarre e strutturare i dati dal testo OCR"""
        
        prompt = f"""Analizza questo testo estratto da un preventivo/fattura italiana.
Estrai i dati in formato JSON strutturato.

TESTO OCR:
{raw_text}

Rispondi SOLO con JSON valido nel formato:
{{
    "supplier": {{
        "name": "nome fornitore",
        "email": "email se presente",
        "phone": "telefono se presente",
        "address": "indirizzo se presente"
    }},
    "date": "data preventivo YYYY-MM-DD",
    "total": numero_totale,
    "items": [
        {{
            "description": "descrizione prodotto",
            "sku": "codice articolo se presente",
            "barcode": "barcode se presente",
            "quantity": numero,
            "unit": "pz/kg/etc",
            "unit_price": prezzo_unitario,
            "total_price": prezzo_totale,
            "vat_percent": aliquota_iva
        }}
    ]
}}

Se un campo non è presente, usa null. Correggi eventuali errori OCR evidenti."""

        try:
            response = await self.anthropic.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=4000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            # Estrai JSON dalla risposta
            json_str = response.content[0].text
            # Pulisci eventuali markdown
            json_str = re.sub(r'```json?\n?', '', json_str)
            json_str = re.sub(r'```\n?', '', json_str)
            
            data = json.loads(json_str)
            
            # Converti items in QuoteItemCreate
            items = [
                QuoteItemCreate(
                    description=item.get("description", ""),
                    sku=item.get("sku"),
                    barcode=item.get("barcode"),
                    quantity=item.get("quantity", 1),
                    unit=item.get("unit", "pz"),
                    unit_price=item.get("unit_price"),
                    total_price=item.get("total_price"),
                    vat_percent=item.get("vat_percent", 22)
                )
                for item in data.get("items", [])
            ]
            
            return {
                "items": items,
                "supplier": data.get("supplier"),
                "total": data.get("total"),
                "date": data.get("date")
            }
            
        except Exception as e:
            logger.error(f"LLM extraction failed: {e}")
            return self._extract_with_regex(raw_text)
    
    def _extract_with_regex(self, raw_text: str) -> dict:
        """Fallback: estrazione con regex per casi semplici"""
        
        items = []
        
        # Pattern comune per righe preventivo italiano
        # Es: "1 | Monitor Dell 27" | 10 | pz | € 299,00 | € 2.990,00"
        patterns = [
            # Pattern con pipe separator
            r'(\d+)\s*\|\s*(.+?)\s*\|\s*(\d+(?:,\d+)?)\s*\|\s*(\w+)\s*\|\s*€?\s*([\d.,]+)\s*\|\s*€?\s*([\d.,]+)',
            # Pattern con tab/spazi
            r'(\d+)\s+(.+?)\s+(\d+(?:,\d+)?)\s+(pz|kg|m|l)\s+€?\s*([\d.,]+)\s+€?\s*([\d.,]+)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, raw_text, re.IGNORECASE)
            for match in matches:
                try:
                    items.append(QuoteItemCreate(
                        description=match[1].strip(),
                        quantity=float(match[2].replace(',', '.')),
                        unit=match[3],
                        unit_price=float(match[4].replace('.', '').replace(',', '.')),
                        total_price=float(match[5].replace('.', '').replace(',', '.'))
                    ))
                except (ValueError, IndexError):
                    continue
        
        # Estrai totale
        total_match = re.search(r'totale\s*:?\s*€?\s*([\d.,]+)', raw_text, re.IGNORECASE)
        total = None
        if total_match:
            try:
                total = float(total_match.group(1).replace('.', '').replace(',', '.'))
            except ValueError:
                pass
        
        return {
            "items": items,
            "supplier": None,
            "total": total,
            "date": None
        }


# Singleton instance
ocr_service = OCRService()
