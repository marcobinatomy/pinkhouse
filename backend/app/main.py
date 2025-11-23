from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from .core.config import settings
from .api.endpoints import quotes, search, reports, products
from .services.scraper.scraper_service import scraper_service

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    logger.info("🚀 Starting PinkHouse API...")
    
    # Initialize browser for scraping
    await scraper_service.init_browser()
    logger.info("✅ Scraper browser initialized")
    
    yield
    
    # Cleanup
    await scraper_service.close()
    logger.info("👋 PinkHouse API shutdown complete")


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
# 🏠 PinkHouse API

**Sistema intelligente di procurement per PMI**

## Features

- 📄 **OCR Preventivi**: Upload PDF/immagini e estrazione automatica dati
- 🔍 **Ricerca Prezzi**: Confronto prezzi su Amazon, ePRICE, Unieuro, MediaWorld
- 🤖 **Report AI**: Analisi automatica con raccomandazioni
- 📊 **Barcode Scanner**: Scansione e ricerca prodotti

## Quick Start

1. Carica un preventivo: `POST /api/v1/quotes/upload`
2. Cerca prezzi: `POST /api/v1/search/quote/{quote_id}`
3. Genera report: `POST /api/v1/reports/generate`
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In produzione: specificare domini
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(quotes.router, prefix=settings.API_PREFIX)
app.include_router(search.router, prefix=settings.API_PREFIX)
app.include_router(reports.router, prefix=settings.API_PREFIX)
app.include_router(products.router, prefix=settings.API_PREFIX)


# Health check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


@app.get("/")
async def root():
    """Root endpoint with API info"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health",
        "api_prefix": settings.API_PREFIX
    }


# Error handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if settings.DEBUG else "An error occurred"
        }
    )
