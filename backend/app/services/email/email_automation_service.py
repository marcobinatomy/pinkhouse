"""
PinkHouse - Smart Procurement Platform
Tool creato da Marco Salvatici e Nicola Casarosa per binatomy.com
Data: 23 Novembre 2024

Email Automation Service - SMTP/IMAP
"""

import smtplib
import imaplib
import email
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.application import MIMEApplication
from email.header import decode_header
from email.utils import parseaddr
import logging
from datetime import datetime
from typing import Optional, List, Dict
import asyncio
from jinja2 import Template

logger = logging.getLogger(__name__)

class EmailAutomationService:
    """Servizio per automazione email: invio richieste e monitoraggio risposte"""
    
    def __init__(self):
        # Configurazione SMTP/IMAP (da settings o env)
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
        self.imap_server = "imap.gmail.com"
        self.imap_port = 993
        self.email_user = "acquisti@company.com"  # Da configurare
        self.email_password = ""  # Da configurare in settings
        self.monitoring_active = False
    
    def configure(self, smtp_server: str, smtp_port: int, imap_server: str, 
                  email_user: str, email_password: str):
        """Configura credenziali email"""
        self.smtp_server = smtp_server
        self.smtp_port = smtp_port
        self.imap_server = imap_server
        self.email_user = email_user
        self.email_password = email_password
        logger.info(f"✅ Email automation configurata per {email_user}")
    
    def generate_quote_request_email(self, supplier_name: str, product_name: str, 
                                    product_code: str, quantity: int, 
                                    custom_notes: str = None) -> Dict[str, str]:
        """Genera email richiesta preventivo personalizzata con template"""
        
        template_text = """
Gentile {{ supplier_name }},

siamo interessati a ricevere un preventivo per il seguente articolo:

ARTICOLO: {{ product_name }}
{% if product_code %}CODICE: {{ product_code }}{% endif %}
QUANTITÀ: {{ quantity }} pezzi

{% if custom_notes %}
NOTE AGGIUNTIVE:
{{ custom_notes }}
{% endif %}

Gradiremmo ricevere quotazione comprensiva di:
- Prezzo unitario e totale
- Disponibilità immediata
- Tempi di consegna
- Condizioni di pagamento (dilazioni)
- Validità dell'offerta

Attendiamo cortese riscontro entro 48 ore.

Cordiali saluti,
Ufficio Acquisti
{{ company_name }}

---
Questa richiesta è stata generata automaticamente da PinkHouse.
Per informazioni: {{ email_user }}
        """
        
        template = Template(template_text)
        body = template.render(
            supplier_name=supplier_name,
            product_name=product_name,
            product_code=product_code,
            quantity=quantity,
            custom_notes=custom_notes,
            company_name="Azienda",  # Da configurare
            email_user=self.email_user
        )
        
        subject = f"Richiesta Preventivo - {product_name}"
        if product_code:
            subject += f" (Cod. {product_code})"
        
        return {
            "subject": subject,
            "body": body.strip()
        }
    
    def send_email(self, to_email: str, subject: str, body: str, 
                   attachments: List[Dict] = None) -> Dict:
        """Invia email via SMTP"""
        
        if not self.email_password:
            logger.warning("❌ Email password non configurata")
            return {
                "success": False,
                "error": "Email non configurata. Vai in Settings."
            }
        
        try:
            # Crea messaggio
            msg = MIMEMultipart()
            msg['From'] = self.email_user
            msg['To'] = to_email
            msg['Subject'] = subject
            msg['Message-ID'] = f"<{datetime.now().timestamp()}@pinkhouse.ai>"
            
            # Aggiungi body
            msg.attach(MIMEText(body, 'plain', 'utf-8'))
            
            # Aggiungi allegati se presenti
            if attachments:
                for attachment in attachments:
                    with open(attachment['path'], 'rb') as f:
                        part = MIMEApplication(f.read(), Name=attachment['filename'])
                        part['Content-Disposition'] = f'attachment; filename="{attachment["filename"]}"'
                        msg.attach(part)
            
            # Invia via SMTP
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.email_user, self.email_password)
                server.send_message(msg)
            
            logger.info(f"✅ Email inviata a {to_email}: {subject}")
            
            return {
                "success": True,
                "message_id": msg['Message-ID'],
                "sent_at": datetime.now().isoformat()
            }
        
        except Exception as e:
            logger.error(f"❌ Errore invio email: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def send_quote_request(self, supplier_email: str, supplier_name: str,
                          product_name: str, product_code: str, 
                          quantity: int, custom_notes: str = None,
                          image_path: str = None) -> Dict:
        """Invia richiesta preventivo a fornitore"""
        
        # Genera email
        email_content = self.generate_quote_request_email(
            supplier_name=supplier_name,
            product_name=product_name,
            product_code=product_code,
            quantity=quantity,
            custom_notes=custom_notes
        )
        
        # Prepara allegati
        attachments = []
        if image_path:
            attachments.append({
                'filename': f'{product_name}.jpg',
                'path': image_path
            })
        
        # Invia
        result = self.send_email(
            to_email=supplier_email,
            subject=email_content['subject'],
            body=email_content['body'],
            attachments=attachments if attachments else None
        )
        
        return result
    
    def monitor_inbox(self) -> List[Dict]:
        """Monitora inbox per nuove email (esegui ogni 5 min con scheduler)"""
        
        if not self.email_password:
            logger.warning("❌ Email password non configurata")
            return []
        
        try:
            # Connetti IMAP
            mail = imaplib.IMAP4_SSL(self.imap_server, self.imap_port)
            mail.login(self.email_user, self.email_password)
            mail.select('INBOX')
            
            # Cerca email non lette
            status, messages = mail.search(None, 'UNSEEN')
            email_ids = messages[0].split()
            
            new_emails = []
            
            for email_id in email_ids:
                # Scarica email
                _, msg_data = mail.fetch(email_id, '(RFC822)')
                email_body = msg_data[0][1]
                message = email.message_from_bytes(email_body)
                
                # Estrai info
                from_email = parseaddr(message['From'])[1]
                subject = decode_header(message['Subject'])[0][0]
                if isinstance(subject, bytes):
                    subject = subject.decode()
                
                # Estrai allegati PDF
                attachments = []
                if message.is_multipart():
                    for part in message.walk():
                        if part.get_content_type() == 'application/pdf':
                            filename = part.get_filename()
                            if filename:
                                attachments.append({
                                    'filename': filename,
                                    'data': part.get_payload(decode=True)
                                })
                
                new_emails.append({
                    'from': from_email,
                    'subject': subject,
                    'date': message['Date'],
                    'message_id': message['Message-ID'],
                    'attachments': attachments
                })
                
                logger.info(f"📧 Nuova email da {from_email}: {subject}")
            
            mail.close()
            mail.logout()
            
            return new_emails
        
        except Exception as e:
            logger.error(f"❌ Errore monitoring inbox: {e}")
            return []
    
    def test_connection(self) -> Dict:
        """Testa connessione SMTP/IMAP"""
        results = {
            "smtp": False,
            "imap": False,
            "errors": []
        }
        
        # Test SMTP
        try:
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.email_user, self.email_password)
            results["smtp"] = True
            logger.info("✅ SMTP connessione OK")
        except Exception as e:
            results["errors"].append(f"SMTP: {str(e)}")
            logger.error(f"❌ SMTP errore: {e}")
        
        # Test IMAP
        try:
            mail = imaplib.IMAP4_SSL(self.imap_server, self.imap_port)
            mail.login(self.email_user, self.email_password)
            mail.logout()
            results["imap"] = True
            logger.info("✅ IMAP connessione OK")
        except Exception as e:
            results["errors"].append(f"IMAP: {str(e)}")
            logger.error(f"❌ IMAP errore: {e}")
        
        return results

# Istanza singleton
email_service = EmailAutomationService()
