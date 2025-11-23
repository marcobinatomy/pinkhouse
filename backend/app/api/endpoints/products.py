from fastapi import APIRouter, HTTPException
from typing import Optional, List
from datetime import datetime, timedelta
from ...schemas.schemas import (
    Product, ProductCreate, PriceComparisonBase
)
from ...db.storage import quotes_db
import random

router = APIRouter(prefix="/products", tags=["Prodotti"])

# Mock database prodotti
products_db = {
    "8003510003853": {
        "barcode": "8003510003853",
        "name": "Mouse Logitech MX Master 3",
        "category": "Elettronica",
        "brand": "Logitech",
        "image_url": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400",
        "specs": {
            "type": "Wireless",
            "connectivity": "Bluetooth + USB Receiver",
            "battery": "70 giorni"
        }
    },
    "5099206085972": {
        "barcode": "5099206085972",
        "name": "Monitor Dell 27\" UltraSharp",
        "category": "Informatica",
        "brand": "Dell",
        "image_url": "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400",
        "specs": {
            "size": "27 pollici",
            "resolution": "2560x1440",
            "panel": "IPS"
        }
    }
}

# Mock storico prezzi
price_history_db = {}


@router.get("/barcode/{barcode}")
async def lookup_barcode(barcode: str):
    """
    Lookup prodotto da barcode
    
    Supporta: EAN-13, UPC-A, Code 128
    """
    if barcode in products_db:
        product = products_db[barcode]
        
        # Genera storico prezzi ultimi 30 giorni
        history = generate_price_history(barcode, days=30)
        
        return {
            "found": True,
            "product": product,
            "price_history": history,
            "current_best_price": min(history, key=lambda x: x["price"]) if history else None
        }
    
    return {
        "found": False,
        "barcode": barcode,
        "message": "Prodotto non trovato. Procedi con ricerca manuale."
    }


@router.get("/search")
async def search_products(
    q: str,
    category: Optional[str] = None,
    limit: int = 10
):
    """
    Ricerca prodotti per nome/descrizione
    """
    results = []
    
    query_lower = q.lower()
    for barcode, product in products_db.items():
        if query_lower in product["name"].lower() or query_lower in product.get("category", "").lower():
            if category and product.get("category") != category:
                continue
            results.append(product)
    
    return {
        "query": q,
        "results": results[:limit],
        "total": len(results)
    }


@router.get("/{barcode}/history")
async def get_price_history(
    barcode: str,
    days: int = 90,
    source: Optional[str] = None
):
    """
    Storico prezzi prodotto
    
    - **days**: Giorni di storico (default 90)
    - **source**: Filtra per fonte specifica (amazon, eprice, etc)
    """
    if barcode not in products_db:
        raise HTTPException(status_code=404, detail="Prodotto non trovato")
    
    history = generate_price_history(barcode, days=days)
    
    if source:
        history = [h for h in history if h["source"] == source]
    
    # Calcola statistiche
    prices = [h["price"] for h in history]
    stats = {
        "min_price": min(prices) if prices else None,
        "max_price": max(prices) if prices else None,
        "avg_price": sum(prices) / len(prices) if prices else None,
        "current_price": prices[-1] if prices else None,
        "trend": "down" if len(prices) > 1 and prices[-1] < prices[0] else "up" if len(prices) > 1 and prices[-1] > prices[0] else "stable"
    }
    
    return {
        "product": products_db[barcode],
        "history": history,
        "stats": stats,
        "period_days": days
    }


@router.post("/")
async def create_product(product: ProductCreate):
    """Crea nuovo prodotto nel catalogo"""
    
    if product.barcode and product.barcode in products_db:
        raise HTTPException(status_code=400, detail="Prodotto già esistente")
    
    product_id = len(products_db) + 1
    products_db[product.barcode or str(product_id)] = {
        "id": product_id,
        **product.model_dump(),
        "created_at": datetime.utcnow()
    }
    
    return products_db[product.barcode or str(product_id)]


def generate_price_history(barcode: str, days: int = 30) -> List[dict]:
    """Genera storico prezzi mock realistico"""
    
    if barcode not in products_db:
        return []
    
    # Prezzo base
    base_price = 89.99 if "mouse" in products_db[barcode]["name"].lower() else 299.99
    
    history = []
    sources = ["amazon", "eprice", "unieuro"]
    
    for day in range(days):
        date = datetime.utcnow() - timedelta(days=days - day)
        
        for source in sources:
            # Variazione casuale ma realistica
            variation = random.uniform(-0.15, 0.10)  # -15% a +10%
            price = base_price * (1 + variation)
            
            # Trend generale: prezzi tendono a scendere verso la fine
            trend_factor = 1 - (day / days * 0.1)  # Max -10% alla fine
            price = price * trend_factor
            
            history.append({
                "date": date.isoformat(),
                "source": source,
                "price": round(price, 2),
                "availability": random.choice(["in_stock", "in_stock", "in_stock", "limited"])
            })
    
    return sorted(history, key=lambda x: x["date"])


@router.get("/categories")
async def list_categories():
    """Lista tutte le categorie prodotti"""
    categories = list(set(p.get("category", "Altro") for p in products_db.values()))
    return {
        "categories": sorted(categories)
    }


@router.get("/brands")
async def list_brands():
    """Lista tutti i brand"""
    brands = list(set(p.get("brand", "Unknown") for p in products_db.values()))
    return {
        "brands": sorted(brands)
    }
