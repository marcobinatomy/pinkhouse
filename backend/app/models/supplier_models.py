"""
PinkHouse - Smart Procurement Platform
Tool creato da Marco Salvatici e Nicola Casarosa per binatomy.com
Data: 23 Novembre 2024

Supplier Management - Database Models
"""

from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
import uuid
import enum

class RequestMethod(str, enum.Enum):
    """Metodi di richiesta preventivo"""
    EMAIL = "email"
    API = "api"
    PORTAL = "portal"
    MANUAL = "manual"

class RequestStatus(str, enum.Enum):
    """Stati richiesta preventivo"""
    PENDING = "pending"
    RECEIVED = "received"
    EXPIRED = "expired"
    REJECTED = "rejected"
    ERROR = "error"

# Mock database per sviluppo (sostituire con SQLAlchemy quando si integra PostgreSQL)
suppliers_db = {
    "uuid-fornitore-a": {
        "id": "uuid-fornitore-a",
        "name": "Fornitore A Tech",
        "category": "Elettronica",
        "portal_url": "https://portal-a.it",
        "api_key": "encrypted_key_a",
        "email_contact": "ordini@fornitore-a.it",
        "phone": "+39 02 1234567",
        "agent_name": "Marco Rossi",
        "request_method": "api",
        "auto_send": True,
        "avg_response_time_hours": 18,
        "reliability_score": 4.8,
        "avg_discount_percentage": 12.5,
        "total_orders": 156,
        "created_at": "2024-01-15T10:00:00",
        "last_request_at": "2024-11-22T14:30:00",
        "is_active": True
    },
    "uuid-fornitore-b": {
        "id": "uuid-fornitore-b",
        "name": "Office Plus Srl",
        "category": "Cancelleria",
        "email_contact": "preventivi@officeplus.it",
        "phone": "+39 06 7654321",
        "agent_name": "Sara Bianchi",
        "request_method": "email",
        "auto_send": True,
        "avg_response_time_hours": 24,
        "reliability_score": 4.5,
        "avg_discount_percentage": 8.3,
        "total_orders": 89,
        "created_at": "2024-02-20T11:00:00",
        "last_request_at": "2024-11-21T09:15:00",
        "is_active": True
    },
    "uuid-fornitore-c": {
        "id": "uuid-fornitore-c",
        "name": "Digital Store",
        "category": "Informatica",
        "portal_url": "https://b2b.digitalstore.it",
        "username": "encrypted_user_c",
        "password": "encrypted_pass_c",
        "email_contact": "b2b@digitalstore.it",
        "phone": "+39 011 9876543",
        "agent_name": "Luca Verdi",
        "request_method": "portal",
        "auto_send": True,
        "avg_response_time_hours": 12,
        "reliability_score": 4.9,
        "avg_discount_percentage": 15.2,
        "total_orders": 203,
        "created_at": "2023-11-10T09:00:00",
        "last_request_at": "2024-11-23T08:45:00",
        "is_active": True
    }
}

supplier_requests_db = {}

def get_all_suppliers(category=None, is_active=True):
    """Recupera tutti i fornitori con filtri opzionali"""
    suppliers = list(suppliers_db.values())
    
    if category:
        suppliers = [s for s in suppliers if s.get("category") == category]
    
    if is_active is not None:
        suppliers = [s for s in suppliers if s.get("is_active") == is_active]
    
    return suppliers

def get_supplier_by_id(supplier_id: str):
    """Recupera singolo fornitore"""
    return suppliers_db.get(supplier_id)

def create_supplier(supplier_data: dict):
    """Crea nuovo fornitore"""
    supplier_id = str(uuid.uuid4())
    supplier_data["id"] = supplier_id
    supplier_data["created_at"] = datetime.now().isoformat()
    supplier_data["is_active"] = True
    supplier_data["total_orders"] = 0
    supplier_data["reliability_score"] = 0.0
    supplier_data["avg_discount_percentage"] = 0.0
    supplier_data["avg_response_time_hours"] = 24
    
    suppliers_db[supplier_id] = supplier_data
    return supplier_data

def update_supplier(supplier_id: str, updates: dict):
    """Aggiorna fornitore esistente"""
    if supplier_id not in suppliers_db:
        return None
    
    suppliers_db[supplier_id].update(updates)
    return suppliers_db[supplier_id]

def delete_supplier(supplier_id: str):
    """Elimina (disattiva) fornitore"""
    if supplier_id in suppliers_db:
        suppliers_db[supplier_id]["is_active"] = False
        return True
    return False

def create_supplier_request(request_data: dict):
    """Crea nuova richiesta preventivo"""
    request_id = str(uuid.uuid4())
    request_data["id"] = request_id
    request_data["created_at"] = datetime.now().isoformat()
    request_data["status"] = "pending"
    
    supplier_requests_db[request_id] = request_data
    
    # Aggiorna last_request_at del fornitore
    supplier_id = request_data.get("supplier_id")
    if supplier_id in suppliers_db:
        suppliers_db[supplier_id]["last_request_at"] = datetime.now().isoformat()
    
    return request_data

def get_supplier_requests(supplier_id=None, status=None):
    """Recupera richieste con filtri"""
    requests = list(supplier_requests_db.values())
    
    if supplier_id:
        requests = [r for r in requests if r.get("supplier_id") == supplier_id]
    
    if status:
        requests = [r for r in requests if r.get("status") == status]
    
    return requests

def update_supplier_request(request_id: str, updates: dict):
    """Aggiorna richiesta preventivo"""
    if request_id not in supplier_requests_db:
        return None
    
    supplier_requests_db[request_id].update(updates)
    
    # Se status diventa "received", aggiorna statistiche fornitore
    if updates.get("status") == "received":
        request = supplier_requests_db[request_id]
        supplier_id = request.get("supplier_id")
        
        if supplier_id in suppliers_db:
            suppliers_db[supplier_id]["total_orders"] += 1
    
    return supplier_requests_db[request_id]
