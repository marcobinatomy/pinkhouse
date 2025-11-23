# 🏠 PinkHouse

**Sistema intelligente di procurement per PMI italiane**

PinkHouse è una piattaforma all-in-one che combina OCR, web scraping e AI per ottimizzare il processo di procurement.

## ✨ Features

- 📄 **OCR Preventivi** - Carica PDF/immagini e estrai automaticamente i dati
- 🔍 **Ricerca Prezzi** - Confronta prezzi su Amazon, ePRICE, Unieuro, MediaWorld
- 🤖 **Report AI** - Analisi automatica con raccomandazioni di Claude/GPT-4
- 📊 **Dashboard** - Monitora risparmi e attività
- 📱 **Responsive** - Funziona su desktop e mobile

## 🛠 Tech Stack

### Backend
- **Python 3.11** + **FastAPI**
- **PostgreSQL** + **Redis**
- **Tesseract OCR** + **OpenCV**
- **Playwright** per web scraping
- **Claude/GPT-4** per AI

### Frontend
- **React 18** + **TypeScript**
- **Vite** + **Tailwind CSS**
- **Shadcn/ui** components
- **TanStack Query** per state

## 🚀 Quick Start

### Con Docker (consigliato)

```bash
# Clona il repo
git clone https://github.com/yourusername/pinkhouse.git
cd pinkhouse

# Copia e configura .env
cp .env.example .env
# Modifica .env con le tue API keys

# Avvia con Docker
docker-compose up -d

# Apri http://localhost:3000
```

### Sviluppo locale

#### Backend
```bash
cd backend

# Crea virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# oppure: venv\Scripts\activate  # Windows

# Installa dipendenze
pip install -r requirements.txt

# Installa Playwright browsers
playwright install chromium

# Avvia server
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend

# Installa dipendenze
npm install

# Avvia dev server
npm run dev
```

## 📁 Struttura Progetto

```
pinkhouse/
├── backend/
│   ├── app/
│   │   ├── api/endpoints/    # API routes
│   │   ├── core/             # Config
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   └── services/         # Business logic
│   │       ├── ocr/          # OCR processing
│   │       ├── scraper/      # Web scraping
│   │       └── ai/           # AI services
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── api/              # API client
│   │   └── hooks/            # Custom hooks
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🔧 API Endpoints

### Quotes (Preventivi)
- `POST /api/v1/quotes/upload` - Upload preventivo
- `GET /api/v1/quotes/` - Lista preventivi
- `GET /api/v1/quotes/{id}` - Dettaglio preventivo

### Search (Ricerca Prezzi)
- `POST /api/v1/search/` - Cerca prezzi
- `POST /api/v1/search/quote/{id}` - Cerca prezzi per preventivo

### Reports
- `POST /api/v1/reports/generate` - Genera report AI
- `GET /api/v1/reports/{id}` - Recupera report

## 🔑 API Keys necessarie

| Servizio | Uso | Link |
|----------|-----|------|
| Anthropic | Report AI, OCR enhancement | https://console.anthropic.com |
| OpenAI | Vision AI (opzionale) | https://platform.openai.com |
| ScraperAPI | Anti-bot bypass (opzionale) | https://scraperapi.com |

## 📈 Roadmap

- [x] MVP con mock data
- [ ] Database persistenza
- [ ] Autenticazione utenti
- [ ] Export PDF report
- [ ] Barcode scanner mobile
- [ ] Notifiche prezzo
- [ ] API pubblica

## 📝 License

MIT License - vedi [LICENSE](LICENSE)

---

Made with 💗 by PinkHouse Team
