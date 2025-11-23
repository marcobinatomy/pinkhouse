from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# === ENUMS ===

class QuoteStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    ANALYZED = "analyzed"
    COMPARED = "compared"
    COMPLETED = "completed"
    ERROR = "error"


class Availability(str, Enum):
    IN_STOCK = "in_stock"
    OUT_OF_STOCK = "out_of_stock"
    LIMITED = "limited"
    UNKNOWN = "unknown"


# === SUPPLIER ===

class SupplierBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    notes: Optional[str] = None


class SupplierCreate(SupplierBase):
    pass


class Supplier(SupplierBase):
    id: int
    rating: float = 0.0
    created_at: datetime

    class Config:
        from_attributes = True


# === PRODUCT ===

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    category: Optional[str] = None
    brand: Optional[str] = None
    image_url: Optional[str] = None
    specs: Optional[dict] = None


class ProductCreate(ProductBase):
    pass


class Product(ProductBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# === QUOTE ITEM ===

class QuoteItemBase(BaseModel):
    description: str
    sku: Optional[str] = None
    barcode: Optional[str] = None
    quantity: float = 1.0
    unit: str = "pz"
    unit_price: Optional[float] = None
    total_price: Optional[float] = None
    discount_percent: float = 0.0
    vat_percent: float = 22.0
    notes: Optional[str] = None


class QuoteItemCreate(QuoteItemBase):
    pass


class QuoteItem(QuoteItemBase):
    id: int
    quote_id: int
    product_id: Optional[int] = None

    class Config:
        from_attributes = True


class QuoteItemWithComparisons(QuoteItem):
    price_comparisons: List["PriceComparison"] = []
    best_price: Optional[float] = None
    savings: Optional[float] = None


# === QUOTE ===

class QuoteBase(BaseModel):
    supplier_id: Optional[int] = None
    total_amount: Optional[float] = None
    currency: str = "EUR"
    notes: Optional[str] = None


class QuoteCreate(QuoteBase):
    items: List[QuoteItemCreate] = []


class Quote(QuoteBase):
    id: int
    original_filename: Optional[str] = None
    status: QuoteStatus = QuoteStatus.PENDING
    quote_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    ocr_confidence: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


class QuoteDetail(Quote):
    items: List[QuoteItemWithComparisons] = []
    supplier: Optional[Supplier] = None
    raw_text: Optional[str] = None
    extracted_data: Optional[dict] = None


# === PRICE COMPARISON ===

class PriceComparisonBase(BaseModel):
    source: str
    source_url: Optional[str] = None
    price: float
    currency: str = "EUR"
    availability: Optional[Availability] = Availability.UNKNOWN
    shipping_cost: Optional[float] = None
    shipping_time: Optional[str] = None
    seller_name: Optional[str] = None
    seller_rating: Optional[float] = None


class PriceComparison(PriceComparisonBase):
    id: int
    quote_item_id: int
    scraped_at: datetime

    class Config:
        from_attributes = True


# === OCR ===

class OCRResult(BaseModel):
    raw_text: str
    confidence: float
    extracted_items: List[QuoteItemCreate]
    supplier_info: Optional[dict] = None
    total_amount: Optional[float] = None
    quote_date: Optional[str] = None


# === SCRAPING ===

class ScrapeRequest(BaseModel):
    query: str
    barcode: Optional[str] = None
    sources: List[str] = ["amazon", "eprice", "unieuro", "mediaworld"]
    max_results: int = 10


class ScrapeResult(BaseModel):
    source: str
    results: List[PriceComparisonBase]
    scraped_at: datetime
    success: bool
    error: Optional[str] = None


# === BARCODE ===

class BarcodeResult(BaseModel):
    barcode: str
    barcode_type: str  # EAN-13, UPC, QR, etc
    product_info: Optional[ProductBase] = None


# === REPORT ===

class ReportRequest(BaseModel):
    quote_id: int
    report_type: str = "comparison"  # comparison, analysis, recommendation
    include_charts: bool = True


class ReportResponse(BaseModel):
    id: int
    title: str
    summary: str
    recommendations: List[dict]
    total_savings: float
    file_path: Optional[str] = None
    created_at: datetime


# === API RESPONSES ===

class UploadResponse(BaseModel):
    quote_id: int
    status: QuoteStatus
    message: str


class SearchResponse(BaseModel):
    query: str
    results: List[ScrapeResult]
    best_price: Optional[PriceComparisonBase] = None
    search_time_ms: int


# Update forward refs
QuoteItemWithComparisons.model_rebuild()
