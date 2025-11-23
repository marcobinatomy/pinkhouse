from fastapi import APIRouter, HTTPException, BackgroundTasks, Body
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

from ...schemas.schemas import ReportRequest, ReportResponse
from ...services.ai.ai_service import ai_service

router = APIRouter(prefix="/reports", tags=["Report AI"])

# In-memory storage per MVP
reports_db: dict = {}


class ImageAnalysisRequest(BaseModel):
    image_base64: str


class TextExtractionRequest(BaseModel):
    text: str
    extraction_type: str = "invoice"


@router.post("/generate", response_model=dict)
async def generate_report(request: ReportRequest):
    """
    Genera report AI per un preventivo
    
    - **quote_id**: ID del preventivo
    - **report_type**: Tipo report (comparison, analysis, recommendation)
    - **include_charts**: Includi grafici nel report
    """
    # Import per evitare circular
    from .quotes import quotes_db
    
    if request.quote_id not in quotes_db:
        raise HTTPException(status_code=404, detail="Preventivo non trovato")
    
    quote = quotes_db[request.quote_id]
    
    if quote.get("status") not in ["analyzed", "compared", "completed"]:
        raise HTTPException(
            status_code=400, 
            detail="Il preventivo deve essere prima analizzato"
        )
    
    # Prepara dati per AI
    price_comparisons = quote.get("price_comparisons", [])
    
    # Genera report
    report_data = await ai_service.generate_comparison_report(
        quote=quote,
        price_comparisons=price_comparisons
    )
    
    # Salva report
    report_id = len(reports_db) + 1
    report = {
        "id": report_id,
        "quote_id": request.quote_id,
        "report_type": request.report_type,
        "created_at": datetime.utcnow(),
        **report_data
    }
    
    reports_db[report_id] = report
    
    # Update quote status
    quotes_db[request.quote_id]["status"] = "completed"
    quotes_db[request.quote_id]["report_id"] = report_id
    
    return report


@router.get("/{report_id}")
async def get_report(report_id: int):
    """Recupera un report generato"""
    if report_id not in reports_db:
        raise HTTPException(status_code=404, detail="Report non trovato")
    
    return reports_db[report_id]


@router.get("/")
async def list_reports(
    quote_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 20
):
    """Lista tutti i report"""
    reports = list(reports_db.values())
    
    if quote_id:
        reports = [r for r in reports if r.get("quote_id") == quote_id]
    
    return reports[skip:skip + limit]


@router.post("/analyze-image")
async def analyze_product_image(request: ImageAnalysisRequest):
    """
    Analizza immagine prodotto con GPT-4 Vision
    
    - **image_base64**: Immagine in base64
    """
    result = await ai_service.analyze_product_image(request.image_base64)
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return result


@router.post("/extract-text")
async def extract_from_text(request: TextExtractionRequest):
    """
    Estrazione intelligente dati da testo
    
    - **text**: Testo da analizzare
    - **extraction_type**: Tipo estrazione (invoice, product, contact)
    """
    result = await ai_service.extract_from_text(request.text, request.extraction_type)
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return result
