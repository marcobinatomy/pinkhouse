"""
PinkHouse - Smart Procurement Platform
Tool creato da Marco Salvatici e Nicola Casarosa per binatomy.com
Data: 23 Novembre 2024

Settings Management - API Endpoints
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
import logging

from ...services.email.email_automation_service import email_service

router = APIRouter(prefix="/settings", tags=["Impostazioni"])
logger = logging.getLogger(__name__)

class EmailSettings(BaseModel):
    smtp_server: str = "smtp.gmail.com"
    smtp_port: int = 587
    imap_server: str = "imap.gmail.com"
    email_user: EmailStr
    email_password: str

class AISettings(BaseModel):
    openai_api_key: Optional[str] = None
    claude_api_key: Optional[str] = None
    preferred_model: str = "gpt-4"

# Mock storage per settings (sostituire con database)
settings_storage = {
    "email": {
        "smtp_server": "smtp.gmail.com",
        "smtp_port": 587,
        "imap_server": "imap.gmail.com",
        "email_user": "",
        "configured": False
    },
    "ai": {
        "openai_api_key": "",
        "claude_api_key": "",
        "preferred_model": "gpt-4",
        "configured": False
    }
}

@router.get("/email")
async def get_email_settings():
    """Recupera impostazioni email (password nascosta)"""
    settings = settings_storage["email"].copy()
    settings["email_password"] = "****" if settings.get("configured") else ""
    return settings

@router.post("/email")
async def save_email_settings(settings: EmailSettings):
    """
    Salva impostazioni email
    
    Configura SMTP per invio e IMAP per monitoraggio inbox.
    """
    # Configura email service
    email_service.configure(
        smtp_server=settings.smtp_server,
        smtp_port=settings.smtp_port,
        imap_server=settings.imap_server,
        email_user=settings.email_user,
        email_password=settings.email_password
    )
    
    # Salva settings (password criptata in produzione)
    settings_storage["email"] = {
        "smtp_server": settings.smtp_server,
        "smtp_port": settings.smtp_port,
        "imap_server": settings.imap_server,
        "email_user": settings.email_user,
        "configured": True
    }
    
    logger.info(f"✅ Email settings salvate per {settings.email_user}")
    
    return {
        "success": True,
        "message": "Impostazioni email salvate con successo"
    }

@router.post("/email/test")
async def test_email_connection():
    """Testa connessione SMTP/IMAP"""
    results = email_service.test_connection()
    
    if results["smtp"] and results["imap"]:
        return {
            "success": True,
            "message": "✅ Connessione email OK (SMTP e IMAP)",
            "details": results
        }
    else:
        return {
            "success": False,
            "message": "❌ Errore connessione email",
            "details": results
        }

@router.get("/ai")
async def get_ai_settings():
    """Recupera impostazioni AI (keys nascoste)"""
    settings = settings_storage["ai"].copy()
    if settings.get("openai_api_key"):
        settings["openai_api_key"] = "sk-..." + settings["openai_api_key"][-8:]
    if settings.get("claude_api_key"):
        settings["claude_api_key"] = "sk-ant..." + settings["claude_api_key"][-8:]
    return settings

@router.post("/ai")
async def save_ai_settings(settings: AISettings):
    """
    Salva impostazioni AI
    
    Configura API keys per OpenAI e Claude.
    """
    settings_storage["ai"] = {
        "openai_api_key": settings.openai_api_key,
        "claude_api_key": settings.claude_api_key,
        "preferred_model": settings.preferred_model,
        "configured": bool(settings.openai_api_key or settings.claude_api_key)
    }
    
    logger.info("✅ AI settings salvate")
    
    return {
        "success": True,
        "message": "Impostazioni AI salvate con successo"
    }

@router.post("/ai/test")
async def test_ai_connection():
    """Testa connessione API AI"""
    # TODO: Implementare test chiamata API
    openai_key = settings_storage["ai"].get("openai_api_key")
    
    if not openai_key:
        return {
            "success": False,
            "message": "❌ API key non configurata"
        }
    
    return {
        "success": True,
        "message": "✅ API key configurata (test completo da implementare)"
    }

@router.get("/")
async def get_all_settings():
    """Recupera tutte le impostazioni (overview)"""
    return {
        "email": {
            "configured": settings_storage["email"].get("configured", False),
            "email_user": settings_storage["email"].get("email_user", "")
        },
        "ai": {
            "configured": settings_storage["ai"].get("configured", False),
            "preferred_model": settings_storage["ai"].get("preferred_model", "gpt-4")
        }
    }
