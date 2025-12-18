# SHL Assessment Recommendation System

An AI-powered recommendation system that suggests relevant SHL assessments based on job descriptions or natural language queries.

## 🎯 Features

- ✅ **Intelligent Query Understanding**: Uses Gemini 1.5 Flash LLM to extract both hard and soft skills
- ✅ **Vector Search**: Sentence embeddings with ChromaDB for semantic similarity
- ✅ **Result Balancing**: Ensures mix of technical and behavioral assessments
- ✅ **URL Support**: Can scrape job descriptions from URLs using FireCrawl
- ✅ **Persistent Storage**: Vector database survives server restarts
- ✅ **Modern UI**: React + TypeScript + Tailwind CSS frontend

## 📁 Project Structure

```
shl-assessment-system/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI server
│   │   ├── models.py            # Pydantic schemas
│   │   ├── scraper_catalog.py   # Web scraper
│   │   ├── rag_engine.py        # RAG logic with balancing
│   │   └── evaluator.py         # Evaluation pipeline
│   ├── data/                    # Assessment data
│   ├── chroma_db/               # Vector database
│   ├── requirements.txt
│   ├── .env                     # API keys
│   └── test_setup.py           # Setup validation
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ResultCard.tsx
│   │   ├── App.tsx
│   │   ├── api.ts
│   │   ├── types.ts
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   └── tsconfig.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+ (for frontend)
- API Keys:
  - Google Gemini API ([Get here](https://aistudio.google.com/apikey))
  - FireCrawl API ([Get here](https://firecrawl.dev/))

### Backend Setup

1. **Install Dependencies**
```bash
cd backend
pip install -r requirements.txt
```

2. **Configure Environment Variables**

Edit `backend/.env`:
```ini
GOOGLE_API_KEY=your_gemini_api_key_here
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
```

3. **Start Backend Server**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

The backend will:
- Attempt to scrape SHL assessment catalog
- Initialize ChromaDB vector database
- Start API server on `http://localhost:8000`

**API Endpoints:**
- `GET /health` - Health check
- `POST /recommend` - Get recommendations (expects `{"query": "..."}`)
- `GET /docs` - Interactive API documentation

### Frontend Setup

**Note:** Requires Node.js installation

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Start Development Server**
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 📊 Evaluation

To evaluate the system on training data:

```bash
cd backend
python -m app.evaluator
```

This will:
- Calculate Mean Recall@10 on train.csv
- Generate predictions.csv for test set
- Display detailed metrics

## 🧪 Testing

Validate your setup:

```bash
cd backend
python test_setup.py
```

This checks:
- Environment variables
- Scraped data (377+ assessments)
- API endpoints
- Result balancing

## 🛠️ Technology Stack

### Backend
- **FastAPI**: High-performance async API framework
- **ChromaDB**: Vector database for embeddings
- **Sentence Transformers**: all-MiniLM-L6-v2 embeddings
- **Google Gemini**: LLM for query balancing
- **FireCrawl**: URL scraping
- **BeautifulSoup**: HTML parsing

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Styling
- **Axios**: HTTP client

## 📝 Usage Examples

### Natural Language Query
```
"Java developer who can collaborate with business teams"
```

### Job Description Text
```
"Looking for a mid-level software engineer with expertise in Python, SQL, and strong communication skills for cross-functional collaboration."
```

### Job Description URL
```
https://example.com/job-posting
```

## 🔧 Current Status

### ✅ Completed
- Backend structure with all files
- FastAPI endpoints implementation
- RAG engine with LLM balancing
- Evaluation pipeline
- Complete frontend application
- All configuration files

### ⚠️ Pending
- **Data Scraping**: The scraper needs actual data from SHL catalog or fallback data
- **Node.js Installation**: Required to run the frontend
- **API Keys**: Need to be configured in `.env`
- **Train/Test Data**: Download from assignment and place in `backend/data/`

## 📚 Next Steps

1. **Configure API Keys**: Add your Gemini and FireCrawl API keys to `backend/.env`

2. **Get Assessment Data**: 
   - Either wait for scraper to fetch from SHL 
   - Or provide fallback data in `backend/../bkcd/ass.json`

3. **Install Node.js**: Download from [nodejs.org](https://nodejs.org/)

4. **Run Frontend**: After Node.js installation, run `npm install` and `npm run dev` in frontend directory

5. **Download Training Data**: Get train.csv and test.csv from the assignment and place in `backend/data/`

## 🎯 Architecture

```
User Query → FastAPI → RAG Engine → [URL Detection] → [Query Balancing via Gemini]
                                  ↓
                          Vector Search (ChromaDB)
                                  ↓
                          Result Balancing (50-50 split)
                                  ↓
                          Top 10 Recommendations
```

## 📄 License

This project is created for the SHL AI Assessment assignment.

## 🤝 Support

For issues or questions:
1. Check logs: Backend prints detailed information
2. Run validation: `python test_setup.py`
3. Test API directly: Visit `http://localhost:8000/docs`

---

**Built with ❤️ for SHL AI Intern Assessment**
