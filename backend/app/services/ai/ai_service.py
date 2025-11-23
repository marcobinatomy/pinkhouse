from anthropic import AsyncAnthropic
import openai
from typing import List, Optional, Dict, Any
import json
from datetime import datetime
from ..core.config import settings
from ..schemas.schemas import QuoteDetail, PriceComparisonBase, ReportResponse
import logging

logger = logging.getLogger(__name__)


class AIService:
    """
    Servizio AI per:
    - Generazione report comparativi
    - Analisi e raccomandazioni
    - Estrazione intelligente dati
    """
    
    def __init__(self):
        self.anthropic = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY) if settings.ANTHROPIC_API_KEY else None
        if settings.OPENAI_API_KEY:
            openai.api_key = settings.OPENAI_API_KEY
    
    async def generate_comparison_report(
        self, 
        quote: Dict[str, Any],
        price_comparisons: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Genera report di confronto prezzi con:
        - Analisi risparmi
        - Raccomandazioni
        - Risk assessment
        """
        
        # Prepara dati per il prompt
        items_data = []
        total_quote_price = 0
        total_best_price = 0
        
        # Supporta sia dict che oggetti
        items = quote.get("items", []) if isinstance(quote, dict) else quote.items
        
        for item in items:
            # Supporta sia dict che oggetti
            if isinstance(item, dict):
                description = item.get("description", "")
                unit_price = item.get("unit_price", 0)
                quantity = item.get("quantity", 1)
                item_id = item.get("id")
            else:
                description = item.description
                unit_price = item.unit_price
                quantity = item.quantity
                item_id = item.id
            
            item_data = {
                "description": description,
                "quote_price": unit_price,
                "quantity": quantity,
                "comparisons": []
            }
            
            # Trova confronti per questo item
            for comp_result in price_comparisons:
                if comp_result.get("item_id") == item_id or comp_result.get("item_index") == items.index(item):
                    results = comp_result.get("results", [])
                    item_data["comparisons"] = [
                        {"source": c.get("source") if isinstance(c, dict) else c.source, 
                         "price": c.get("price") if isinstance(c, dict) else c.price}
                        for c in results
                    ]
            
            # Calcola best price
            if item_data["comparisons"]:
                best = min(item_data["comparisons"], key=lambda x: x["price"])
                item_data["best_price"] = best["price"]
                item_data["best_source"] = best["source"]
                item_data["savings_per_unit"] = (unit_price or 0) - best["price"]
            
            items_data.append(item_data)
            total_quote_price += (unit_price or 0) * quantity
            total_best_price += item_data.get("best_price", unit_price or 0) * quantity
        
        total_savings = total_quote_price - total_best_price
        savings_percent = (total_savings / total_quote_price * 100) if total_quote_price > 0 else 0
        
        # Ottieni nome fornitore
        if isinstance(quote, dict):
            supplier = quote.get("supplier", {})
            supplier_name = supplier.get("name", "Non specificato") if isinstance(supplier, dict) else "Non specificato"
        else:
            supplier_name = quote.supplier.name if quote.supplier else "Non specificato"
        
        # Genera analisi AI
        prompt = f"""Sei un esperto analista procurement. Genera un report di analisi in italiano per questo preventivo.

DATI PREVENTIVO:
Fornitore: {supplier_name}
Totale preventivo: €{total_quote_price:,.2f}
Miglior totale trovato: €{total_best_price:,.2f}
Risparmio potenziale: €{total_savings:,.2f} ({savings_percent:.1f}%)

DETTAGLIO ARTICOLI:
{json.dumps(items_data, indent=2, ensure_ascii=False)}

Genera un report JSON con:
{{
    "summary": "Riassunto esecutivo in 2-3 frasi",
    "analysis": "Analisi dettagliata (3-4 paragrafi)",
    "recommendations": [
        {{
            "priority": "alta/media/bassa",
            "action": "azione raccomandata",
            "impact": "impatto stimato",
            "savings": numero_risparmio
        }}
    ],
    "risks": [
        {{
            "type": "tipo rischio",
            "description": "descrizione",
            "mitigation": "come mitigare"
        }}
    ],
    "conclusion": "Conclusione e prossimi passi"
}}

Rispondi SOLO con JSON valido."""

        try:
            response = await self.anthropic.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=2000,
                messages=[{"role": "user", "content": prompt}]
            )
            
            result_text = response.content[0].text
            # Pulisci markdown
            result_text = result_text.replace('```json', '').replace('```', '').strip()
            
            report_data = json.loads(result_text)
            
            return {
                "title": f"Report Analisi Preventivo - {quote.supplier.name if quote.supplier else 'Preventivo'} - {datetime.now().strftime('%d/%m/%Y')}",
                "summary": report_data.get("summary", ""),
                "analysis": report_data.get("analysis", ""),
                "recommendations": report_data.get("recommendations", []),
                "risks": report_data.get("risks", []),
                "conclusion": report_data.get("conclusion", ""),
                "metrics": {
                    "total_quote": total_quote_price,
                    "total_best": total_best_price,
                    "total_savings": total_savings,
                    "savings_percent": savings_percent,
                    "items_analyzed": len(items_data)
                }
            }
            
        except Exception as e:
            logger.error(f"AI report generation failed: {e}")
            # Fallback a report base
            return {
                "title": f"Report Analisi Preventivo - {datetime.now().strftime('%d/%m/%Y')}",
                "summary": f"Risparmio potenziale identificato: €{total_savings:,.2f} ({savings_percent:.1f}%)",
                "analysis": "Analisi AI non disponibile. Vedi metriche per dettagli.",
                "recommendations": [
                    {
                        "priority": "alta" if savings_percent > 10 else "media",
                        "action": "Negoziare con fornitore o considerare alternative",
                        "impact": f"Potenziale risparmio €{total_savings:,.2f}",
                        "savings": total_savings
                    }
                ],
                "risks": [],
                "conclusion": "Verificare disponibilità e tempi di consegna prima di procedere.",
                "metrics": {
                    "total_quote": total_quote_price,
                    "total_best": total_best_price,
                    "total_savings": total_savings,
                    "savings_percent": savings_percent,
                    "items_analyzed": len(items_data)
                }
            }
    
    async def analyze_product_image(self, image_base64: str) -> Dict[str, Any]:
        """
        Usa GPT-4 Vision per riconoscere prodotto da immagine
        """
        
        if not settings.OPENAI_API_KEY:
            return {"error": "OpenAI API key not configured"}
        
        try:
            response = await openai.ChatCompletion.acreate(
                model="gpt-4-vision-preview",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": """Analizza questa immagine di un prodotto.
Estrai:
- Nome/modello prodotto
- Brand/marca
- Categoria
- Caratteristiche principali visibili
- Eventuali codici/SKU visibili

Rispondi in JSON:
{
    "product_name": "nome",
    "brand": "marca",
    "category": "categoria",
    "features": ["feature1", "feature2"],
    "visible_codes": ["codice1"],
    "search_query": "query ottimale per cercare questo prodotto"
}"""
                            },
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:image/jpeg;base64,{image_base64}"
                                }
                            }
                        ]
                    }
                ],
                max_tokens=500
            )
            
            result_text = response.choices[0].message.content
            result_text = result_text.replace('```json', '').replace('```', '').strip()
            
            return json.loads(result_text)
            
        except Exception as e:
            logger.error(f"Vision analysis failed: {e}")
            return {"error": str(e)}
    
    async def extract_from_text(self, text: str, extraction_type: str = "invoice") -> Dict[str, Any]:
        """
        Estrazione intelligente dati da testo
        """
        
        prompts = {
            "invoice": """Estrai i dati da questa fattura/preventivo:
- Fornitore (nome, indirizzo, P.IVA)
- Data e numero documento
- Lista articoli con quantità, prezzo unitario, totale
- Totali (imponibile, IVA, totale)

Rispondi in JSON strutturato.""",
            
            "product": """Identifica il prodotto descritto:
- Nome/modello
- Brand
- Specifiche tecniche
- Prezzo se indicato

Rispondi in JSON.""",
            
            "contact": """Estrai informazioni di contatto:
- Nome azienda
- Email
- Telefono
- Indirizzo
- Sito web

Rispondi in JSON."""
        }
        
        prompt = prompts.get(extraction_type, prompts["invoice"])
        
        try:
            response = await self.anthropic.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=1500,
                messages=[
                    {
                        "role": "user", 
                        "content": f"{prompt}\n\nTESTO:\n{text}\n\nRispondi SOLO con JSON valido."
                    }
                ]
            )
            
            result_text = response.content[0].text
            result_text = result_text.replace('```json', '').replace('```', '').strip()
            
            return json.loads(result_text)
            
        except Exception as e:
            logger.error(f"Text extraction failed: {e}")
            return {"error": str(e)}


# Singleton instance
ai_service = AIService()
