from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks, Depends
from typing import List, Optional
import aiofiles
import os
from datetime import datetime
import uuid

from ...schemas.schemas import (
    Quote, QuoteCreate, QuoteDetail, QuoteStatus,
    UploadResponse, OCRResult
)
from ...services.ocr.ocr_service import ocr_service
from ...core.config import settings

router = APIRouter(prefix="/quotes", tags=["Preventivi"])

# In-memory storage per MVP (sostituire con DB)
quotes_db: dict = {}


@router.post("/upload", response_model=UploadResponse)
async def upload_quote(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    """
    Upload preventivo PDF/immagine per estrazione OCR
    """
    # Valida file
    allowed_extensions = {'.pdf', '.png', '.jpg', '.jpeg', '.tiff'}
    ext = os.path.splitext(file.filename)[1].lower()
    
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Formato non supportato. Usa: {', '.join(allowed_extensions)}"
        )
    
    # Verifica dimensione
    content = await file.read()
    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File troppo grande. Max: {settings.MAX_UPLOAD_SIZE // 1024 // 1024}MB"
        )
    
    # Salva file
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_id = str(uuid.uuid4())
    file_path = os.path.join(settings.UPLOAD_DIR, f"{file_id}{ext}")
    
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(content)
    
    # Crea record quote
    quote_id = len(quotes_db) + 1
    quotes_db[quote_id] = {
        "id": quote_id,
        "original_filename": file.filename,
        "file_path": file_path,
        "status": QuoteStatus.PROCESSING,
        "created_at": datetime.utcnow(),
        "items": [],
        "extracted_data": None,
        "ocr_confidence": None
    }
    
    # Process OCR in background
    if background_tasks:
        background_tasks.add_task(process_ocr, quote_id, content, file.filename)
    else:
        await process_ocr(quote_id, content, file.filename)
    
    return UploadResponse(
        quote_id=quote_id,
        status=QuoteStatus.PROCESSING,
        message="Upload completato. Elaborazione OCR in corso..."
    )


async def process_ocr(quote_id: int, file_bytes: bytes, filename: str):
    """Background task per OCR processing"""
    try:
        result = await ocr_service.process_document(file_bytes, filename)
        
        quotes_db[quote_id].update({
            "status": QuoteStatus.ANALYZED,
            "raw_text": result.raw_text,
            "ocr_confidence": result.confidence,
            "extracted_data": {
                "supplier": result.supplier_info,
                "total": result.total_amount,
                "date": result.quote_date
            },
            "items": [item.model_dump() for item in result.extracted_items]
        })
        
    except Exception as e:
        quotes_db[quote_id].update({
            "status": QuoteStatus.ERROR,
            "error": str(e)
        })


@router.get("/", response_model=List[Quote])
async def list_quotes(
    status: Optional[QuoteStatus] = None,
    skip: int = 0,
    limit: int = 20
):
    """Lista tutti i preventivi"""
    quotes = list(quotes_db.values())
    
    if status:
        quotes = [q for q in quotes if q["status"] == status]
    
    return quotes[skip:skip + limit]


@router.get("/{quote_id}", response_model=QuoteDetail)
async def get_quote(quote_id: int):
    """Dettaglio singolo preventivo con items e comparazioni"""
    if quote_id not in quotes_db:
        raise HTTPException(status_code=404, detail="Preventivo non trovato")
    
    return quotes_db[quote_id]


@router.delete("/{quote_id}")
async def delete_quote(quote_id: int):
    """Elimina preventivo"""
    if quote_id not in quotes_db:
        raise HTTPException(status_code=404, detail="Preventivo non trovato")
    
    # Rimuovi file
    file_path = quotes_db[quote_id].get("file_path")
    if file_path and os.path.exists(file_path):
        os.remove(file_path)
    
    del quotes_db[quote_id]
    return {"message": "Preventivo eliminato"}


@router.post("/{quote_id}/reprocess")
async def reprocess_quote(quote_id: int, background_tasks: BackgroundTasks):
    """Rielabora OCR per un preventivo"""
    if quote_id not in quotes_db:
        raise HTTPException(status_code=404, detail="Preventivo non trovato")
    
    file_path = quotes_db[quote_id].get("file_path")
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=400, detail="File originale non disponibile")
    
    async with aiofiles.open(file_path, 'rb') as f:
        content = await f.read()
    
    quotes_db[quote_id]["status"] = QuoteStatus.PROCESSING
    
    background_tasks.add_task(
        process_ocr, 
        quote_id, 
        content, 
        quotes_db[quote_id]["original_filename"]
    )
    
    return {"message": "Rielaborazione avviata"}


@router.patch("/{quote_id}/items/{item_index}")
async def update_quote_item(quote_id: int, item_index: int, updates: dict):
    """Modifica manuale item preventivo (correzione OCR)"""
    if quote_id not in quotes_db:
        raise HTTPException(status_code=404, detail="Preventivo non trovato")
    
    items = quotes_db[quote_id].get("items", [])
    if item_index >= len(items):
        raise HTTPException(status_code=404, detail="Item non trovato")
    
    # Update fields
    for key, value in updates.items():
        if key in items[item_index]:
            items[item_index][key] = value
    
    return items[item_index]
