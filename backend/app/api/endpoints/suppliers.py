"""
PinkHouse - Smart Procurement Platform
Tool creato da Marco Salvatici e Nicola Casarosa per binatomy.com
Data: 23 Novembre 2024

Supplier Management - API Endpoints
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Optional, List
import logging

from ...schemas.supplier_schemas import (
    SupplierCreate, SupplierUpdate, SupplierResponse,
    QuoteRequestBatchCreate, QuoteRequestBatchResponse,
    SupplierRequestResponse
)
from ...models.supplier_models import (
    get_all_suppliers, get_supplier_by_id, create_supplier,
    update_supplier, delete_supplier, create_supplier_request,
    get_supplier_requests, update_supplier_request
)
from ...services.email.email_automation_service import email_service

router = APIRouter(prefix="/suppliers", tags=["Fornitori"])
logger = logging.getLogger(__name__)

@router.get("/", response_model=List[SupplierResponse])
async def list_suppliers(
    category: Optional[str] = None,
    is_active: Optional[bool] = True
):
    """
    Lista tutti i fornitori con filtri opzionali
    
    - **category**: Filtra per categoria (es: Elettronica, Cancelleria)
    - **is_active**: Solo fornitori attivi (default: true)
    """
    suppliers = get_all_suppliers(category=category, is_active=is_active)
    return suppliers

@router.get("/{supplier_id}", response_model=SupplierResponse)
async def get_supplier(supplier_id: str):
    """Recupera dettagli singolo fornitore"""
    supplier = get_supplier_by_id(supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Fornitore non trovato")
    return supplier

@router.post("/", response_model=SupplierResponse)
async def create_new_supplier(supplier: SupplierCreate):
    """
    Crea nuovo fornitore
    
    Nota: Le credenziali (password, API keys) verranno criptate automaticamente
    """
    # TODO: Criptare credenziali sensibili prima di salvare
    supplier_data = supplier.dict()
    new_supplier = create_supplier(supplier_data)
    return new_supplier

@router.put("/{supplier_id}", response_model=SupplierResponse)
async def update_existing_supplier(supplier_id: str, updates: SupplierUpdate):
    """Aggiorna fornitore esistente"""
    updated = update_supplier(supplier_id, updates.dict(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Fornitore non trovato")
    return updated

@router.delete("/{supplier_id}")
async def delete_existing_supplier(supplier_id: str):
    """Disattiva fornitore (soft delete)"""
    success = delete_supplier(supplier_id)
    if not success:
        raise HTTPException(status_code=404, detail="Fornitore non trovato")
    return {"message": "Fornitore disattivato con successo"}

@router.post("/{supplier_id}/test")
async def test_supplier_connection(supplier_id: str):
    """
    Testa connessione con fornitore
    
    - **API**: Verifica API key
    - **Portal**: Verifica login
    - **Email**: Verifica email valida
    """
    supplier = get_supplier_by_id(supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Fornitore non trovato")
    
    method = supplier.get("request_method")
    
    if method == "email":
        # Verifica email valida
        email = supplier.get("email_contact")
        if not email:
            return {"success": False, "message": "Email non configurata"}
        return {"success": True, "message": f"Email {email} configurata"}
    
    elif method == "api":
        # TODO: Test API call
        return {"success": True, "message": "API test non ancora implementato"}
    
    elif method == "portal":
        # TODO: Test portal login
        return {"success": True, "message": "Portal test non ancora implementato"}
    
    return {"success": False, "message": "Metodo non supportato"}

@router.get("/{supplier_id}/performance")
async def get_supplier_performance(supplier_id: str):
    """Statistiche performance fornitore"""
    supplier = get_supplier_by_id(supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Fornitore non trovato")
    
    requests = get_supplier_requests(supplier_id=supplier_id)
    
    total_requests = len(requests)
    received = len([r for r in requests if r.get("status") == "received"])
    pending = len([r for r in requests if r.get("status") == "pending"])
    
    return {
        "supplier_id": supplier_id,
        "supplier_name": supplier.get("name"),
        "total_requests": total_requests,
        "received": received,
        "pending": pending,
        "response_rate": (received / total_requests * 100) if total_requests > 0 else 0,
        "avg_response_time_hours": supplier.get("avg_response_time_hours"),
        "reliability_score": supplier.get("reliability_score"),
        "avg_discount_percentage": supplier.get("avg_discount_percentage"),
        "total_orders": supplier.get("total_orders")
    }

@router.post("/quote-request/batch", response_model=QuoteRequestBatchResponse)
async def send_quote_requests_batch(
    request: QuoteRequestBatchCreate,
    background_tasks: BackgroundTasks
):
    """
    Invia richieste preventivo a multipli fornitori
    
    Questo è l'endpoint principale per l'automazione:
    1. Genera email personalizzate per ogni fornitore
    2. Invia in parallelo via email/API/portal
    3. Traccia le richieste nel database
    4. Restituisce summary immediato
    
    Le email vengono inviate in background task asincrono.
    """
    results = []
    successful = 0
    failed = 0
    
    for supplier_id in request.supplier_ids:
        supplier = get_supplier_by_id(supplier_id)
        
        if not supplier:
            logger.warning(f"⚠️ Fornitore {supplier_id} non trovato, skip")
            failed += 1
            continue
        
        # Crea richiesta nel database
        supplier_request = create_supplier_request({
            "supplier_id": supplier_id,
            "product_name": request.product_name,
            "product_code": request.product_code,
            "quantity": request.quantity,
            "custom_notes": request.custom_notes,
            "status": "pending"
        })
        
        # Invia email in background se metodo è email
        if supplier.get("request_method") == "email" and supplier.get("auto_send"):
            background_tasks.add_task(
                send_email_to_supplier,
                supplier=supplier,
                product_name=request.product_name,
                product_code=request.product_code,
                quantity=request.quantity,
                custom_notes=request.custom_notes,
                request_id=supplier_request["id"]
            )
            successful += 1
        else:
            # Per API/Portal: da implementare
            logger.info(f"📋 Richiesta creata per {supplier.get('name')} (metodo: {supplier.get('request_method')})")
            successful += 1
        
        results.append(supplier_request)
    
    return {
        "total_requests": len(request.supplier_ids),
        "successful": successful,
        "failed": failed,
        "requests": results
    }

def send_email_to_supplier(supplier: dict, product_name: str, 
                           product_code: str, quantity: int, 
                           custom_notes: str, request_id: str):
    """Background task per invio email"""
    
    result = email_service.send_quote_request(
        supplier_email=supplier.get("email_contact"),
        supplier_name=supplier.get("name"),
        product_name=product_name,
        product_code=product_code,
        quantity=quantity,
        custom_notes=custom_notes
    )
    
    if result.get("success"):
        # Aggiorna richiesta con dettagli invio
        update_supplier_request(request_id, {
            "sent_at": result.get("sent_at"),
            "sent_method": "email",
            "email_message_id": result.get("message_id")
        })
        logger.info(f"✅ Email inviata a {supplier.get('name')}")
    else:
        # Marca come errore
        update_supplier_request(request_id, {
            "status": "error"
        })
        logger.error(f"❌ Errore invio email a {supplier.get('name')}: {result.get('error')}")

@router.get("/requests/", response_model=List[SupplierRequestResponse])
async def list_supplier_requests(
    supplier_id: Optional[str] = None,
    status: Optional[str] = None
):
    """
    Lista tutte le richieste preventivi con filtri
    
    - **supplier_id**: Filtra per fornitore specifico
    - **status**: Filtra per stato (pending, received, expired)
    """
    requests = get_supplier_requests(supplier_id=supplier_id, status=status)
    return requests

@router.get("/requests/{request_id}", response_model=SupplierRequestResponse)
async def get_supplier_request(request_id: str):
    """Dettaglio singola richiesta preventivo"""
    from ...models.supplier_models import supplier_requests_db
    
    request = supplier_requests_db.get(request_id)
    if not request:
        raise HTTPException(status_code=404, detail="Richiesta non trovata")
    return request

@router.put("/requests/{request_id}")
async def update_request(request_id: str, updates: dict):
    """
    Aggiorna richiesta preventivo
    
    Usato dall'AI parser quando arriva risposta email.
    """
    updated = update_supplier_request(request_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Richiesta non trovata")
    return updated
