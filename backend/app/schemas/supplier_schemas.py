"""
PinkHouse - Smart Procurement Platform
Tool creato da Marco Salvatici e Nicola Casarosa per binatomy.com
Data: 23 Novembre 2024

Supplier Management - Pydantic Schemas
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class SupplierBase(BaseModel):
    name: str
    category: Optional[str] = None
    portal_url: Optional[str] = None
    email_contact: Optional[EmailStr] = None
    phone: Optional[str] = None
    agent_name: Optional[str] = None
    request_method: str = "email"
    auto_send: bool = True

class SupplierCreate(SupplierBase):
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    portal_url: Optional[str] = None
    email_contact: Optional[EmailStr] = None
    phone: Optional[str] = None
    agent_name: Optional[str] = None
    request_method: Optional[str] = None
    auto_send: Optional[bool] = None
    is_active: Optional[bool] = None
    api_key: Optional[str] = None
    api_secret: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None

class SupplierResponse(BaseModel):
    id: str
    name: str
    category: Optional[str] = None
    portal_url: Optional[str] = None
    email_contact: Optional[str] = None
    phone: Optional[str] = None
    agent_name: Optional[str] = None
    request_method: str
    auto_send: bool
    avg_response_time_hours: int
    reliability_score: float
    avg_discount_percentage: float
    total_orders: int
    created_at: str
    last_request_at: Optional[str] = None
    is_active: bool

class SupplierRequestCreate(BaseModel):
    supplier_ids: list[str]  # Può inviare a multipli fornitori
    product_name: str
    product_code: Optional[str] = None
    quantity: int = 1
    custom_notes: Optional[str] = None
    product_image_url: Optional[str] = None

class SupplierRequestResponse(BaseModel):
    id: str
    supplier_id: str
    product_name: str
    product_code: Optional[str]
    quantity: int
    status: str
    sent_at: Optional[str]
    received_at: Optional[str]
    quote_price: Optional[float]
    quote_validity_days: Optional[int]
    quote_delivery_days: Optional[int]
    quote_payment_terms: Optional[str]
    ai_confidence_score: Optional[float]
    ai_recommendation: Optional[str]
    created_at: str

class QuoteRequestBatchCreate(BaseModel):
    """Richiesta batch preventivi a multipli fornitori"""
    product_name: str
    product_code: Optional[str] = None
    quantity: int = 1
    supplier_ids: list[str]
    custom_notes: Optional[str] = None
    product_image_base64: Optional[str] = None

class QuoteRequestBatchResponse(BaseModel):
    """Risposta batch con dettagli per ogni fornitore"""
    total_requests: int
    successful: int
    failed: int
    requests: list[SupplierRequestResponse]
