from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON, Enum, Boolean
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
import enum

Base = declarative_base()


class QuoteStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    ANALYZED = "analyzed"
    COMPARED = "compared"
    COMPLETED = "completed"
    ERROR = "error"


class Supplier(Base):
    """Fornitori"""
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    email = Column(String(255))
    phone = Column(String(50))
    address = Column(Text)
    website = Column(String(255))
    notes = Column(Text)
    rating = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    quotes = relationship("Quote", back_populates="supplier")


class Quote(Base):
    """Preventivi caricati"""
    __tablename__ = "quotes"
    
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=True)
    original_filename = Column(String(255))
    file_path = Column(String(500))
    status = Column(Enum(QuoteStatus), default=QuoteStatus.PENDING)
    total_amount = Column(Float)
    currency = Column(String(10), default="EUR")
    quote_date = Column(DateTime(timezone=True))
    expiry_date = Column(DateTime(timezone=True))
    raw_text = Column(Text)  # OCR output
    extracted_data = Column(JSON)  # Structured data from OCR
    ocr_confidence = Column(Float)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    supplier = relationship("Supplier", back_populates="quotes")
    items = relationship("QuoteItem", back_populates="quote", cascade="all, delete-orphan")


class QuoteItem(Base):
    """Singoli item in un preventivo"""
    __tablename__ = "quote_items"
    
    id = Column(Integer, primary_key=True, index=True)
    quote_id = Column(Integer, ForeignKey("quotes.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    description = Column(Text, nullable=False)
    sku = Column(String(100))
    barcode = Column(String(50))
    quantity = Column(Float, default=1.0)
    unit = Column(String(20), default="pz")
    unit_price = Column(Float)
    total_price = Column(Float)
    discount_percent = Column(Float, default=0.0)
    vat_percent = Column(Float, default=22.0)
    notes = Column(Text)
    
    quote = relationship("Quote", back_populates="items")
    product = relationship("Product", back_populates="quote_items")
    price_comparisons = relationship("PriceComparison", back_populates="quote_item")


class Product(Base):
    """Catalogo prodotti"""
    __tablename__ = "products"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    sku = Column(String(100), index=True)
    barcode = Column(String(50), unique=True, index=True)
    category = Column(String(100))
    brand = Column(String(100))
    image_url = Column(String(500))
    specs = Column(JSON)  # Technical specifications
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    quote_items = relationship("QuoteItem", back_populates="product")
    price_history = relationship("PriceHistory", back_populates="product")


class PriceComparison(Base):
    """Confronti prezzi da web scraping"""
    __tablename__ = "price_comparisons"
    
    id = Column(Integer, primary_key=True, index=True)
    quote_item_id = Column(Integer, ForeignKey("quote_items.id"), nullable=False)
    source = Column(String(100), nullable=False)  # amazon, eprice, unieuro, etc
    source_url = Column(String(500))
    price = Column(Float, nullable=False)
    currency = Column(String(10), default="EUR")
    availability = Column(String(50))  # in_stock, out_of_stock, limited
    shipping_cost = Column(Float)
    shipping_time = Column(String(100))
    seller_name = Column(String(255))
    seller_rating = Column(Float)
    scraped_at = Column(DateTime(timezone=True), server_default=func.now())
    
    quote_item = relationship("QuoteItem", back_populates="price_comparisons")


class PriceHistory(Base):
    """Storico prezzi per analytics"""
    __tablename__ = "price_history"
    
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    source = Column(String(100), nullable=False)
    price = Column(Float, nullable=False)
    currency = Column(String(10), default="EUR")
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    product = relationship("Product", back_populates="price_history")


class Report(Base):
    """Report AI generati"""
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    quote_id = Column(Integer, ForeignKey("quotes.id"), nullable=True)
    report_type = Column(String(50))  # comparison, analysis, recommendation
    title = Column(String(255))
    content = Column(Text)  # Markdown or HTML
    summary = Column(Text)
    recommendations = Column(JSON)
    total_savings = Column(Float)
    file_path = Column(String(500))  # Generated PDF path
    created_at = Column(DateTime(timezone=True), server_default=func.now())
