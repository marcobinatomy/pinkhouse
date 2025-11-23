"""
In-memory storage per MVP
Sarà sostituito con SQLAlchemy DB in produzione
"""

# Storage globale per l'applicazione
quotes_db: dict = {}
reports_db: dict = {}
search_cache: dict = {}
