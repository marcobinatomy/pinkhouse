from fastapi import APIRouter, HTTPException, BackgroundTasks, Query
from typing import List, Optional
from datetime import datetime
import time

from ...schemas.schemas import (
    ScrapeRequest, ScrapeResult, SearchResponse,
    PriceComparisonBase
)
from ...services.scraper.scraper_service import scraper_service

router = APIRouter(prefix="/search", tags=["Ricerca Prezzi"])

# Cache in-memory per MVP
search_cache: dict = {}


@router.post("/", response_model=SearchResponse)
async def search_prices(request: ScrapeRequest):
    """
    Cerca prezzi su multiple fonti
    
    - **query**: Termine di ricerca (nome prodotto)
    - **barcode**: Barcode EAN/UPC opzionale
    - **sources**: Lista fonti da cercare (default: tutte)
    - **max_results**: Max risultati per fonte
    """
    start_time = time.time()
    
    # Check cache
    cache_key = f"{request.query}:{request.barcode}:{','.join(sorted(request.sources))}"
    if cache_key in search_cache:
        cached = search_cache[cache_key]
        if (datetime.utcnow() - cached["timestamp"]).seconds < 3600:  # 1 hour cache
            return cached["data"]
    
    # Esegui scraping
    results = await scraper_service.search_all_sources(
        query=request.query,
        barcode=request.barcode,
        sources=request.sources
    )
    
    # Trova miglior prezzo
    all_prices = []
    for result in results:
        if result.success:
            all_prices.extend(result.results)
    
    best_price = None
    if all_prices:
        best_price = min(all_prices, key=lambda x: x.price)
    
    search_time = int((time.time() - start_time) * 1000)
    
    response = SearchResponse(
        query=request.query,
        results=results,
        best_price=best_price,
        search_time_ms=search_time
    )
    
    # Cache result
    search_cache[cache_key] = {
        "timestamp": datetime.utcnow(),
        "data": response
    }
    
    return response


@router.get("/quick")
async def quick_search(
    q: str = Query(..., min_length=2, description="Termine di ricerca"),
    barcode: Optional[str] = Query(None, description="Barcode EAN/UPC"),
    sources: str = Query("amazon,eprice,trovaprezzi", description="Fonti separate da virgola")
):
    """
    Ricerca veloce prezzi (GET endpoint)
    """
    source_list = [s.strip() for s in sources.split(",")]
    
    request = ScrapeRequest(
        query=q,
        barcode=barcode,
        sources=source_list,
        max_results=5
    )
    
    return await search_prices(request)


@router.post("/quote/{quote_id}")
async def search_quote_prices(
    quote_id: int,
    background_tasks: BackgroundTasks,
    sources: List[str] = None
):
    """
    Cerca prezzi per tutti gli items di un preventivo
    """
    # Import qui per evitare circular import
    from .quotes import quotes_db
    
    if quote_id not in quotes_db:
        raise HTTPException(status_code=404, detail="Preventivo non trovato")
    
    quote = quotes_db[quote_id]
    items = quote.get("items", [])
    
    if not items:
        raise HTTPException(status_code=400, detail="Nessun item nel preventivo")
    
    # Cerca prezzi per ogni item
    all_results = []
    
    for i, item in enumerate(items):
        query = item.get("description", "")
        barcode = item.get("barcode")
        
        if query or barcode:
            results = await scraper_service.search_all_sources(
                query=query,
                barcode=barcode,
                sources=sources or ["amazon", "eprice", "trovaprezzi"]
            )
            
            all_results.append({
                "item_index": i,
                "item_description": query,
                "results": results
            })
    
    # Update quote status
    quotes_db[quote_id]["status"] = "compared"
    quotes_db[quote_id]["price_comparisons"] = all_results
    
    return {
        "quote_id": quote_id,
        "items_searched": len(all_results),
        "results": all_results
    }


@router.get("/sources")
async def list_sources():
    """Lista fonti disponibili per la ricerca"""
    return {
        "sources": [
            {
                "id": "amazon",
                "name": "Amazon.it",
                "description": "Marketplace principale",
                "reliability": "alta"
            },
            {
                "id": "eprice",
                "name": "ePRICE",
                "description": "Elettronica e tech",
                "reliability": "alta"
            },
            {
                "id": "unieuro",
                "name": "Unieuro",
                "description": "Elettronica consumer",
                "reliability": "media"
            },
            {
                "id": "mediaworld",
                "name": "MediaWorld",
                "description": "Elettronica e elettrodomestici",
                "reliability": "media"
            },
            {
                "id": "trovaprezzi",
                "name": "TrovaPrezzi",
                "description": "Aggregatore multi-shop",
                "reliability": "alta"
            }
        ]
    }


@router.delete("/cache")
async def clear_cache():
    """Pulisce la cache delle ricerche"""
    search_cache.clear()
    return {"message": "Cache pulita"}
