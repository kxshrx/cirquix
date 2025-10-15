# E-commerce Recommendation API with LLM Explanations

FastAPI backend for serving product recommendations with AI-generated explanations using Groq API.

## Features

- **Product Information**: Get detailed product metadata
- **User History**: Track user interactions and purchase patterns  
- **Hybrid Recommendations**: ML-powered recommendations with fallback strategies
- **LLM Explanations**: Natural language explanations via Groq API with intelligent fallbacks
- **Related Products**: Co-occurrence based product suggestions

## Setup

```bash
cd 05_backend
pip install -r requirements.txt
```

## Environment Configuration

Create `.env` file with your Groq API key:

```bash
GROQ_API_KEY=your_groq_api_key_here
```

If no API key is provided, the system uses intelligent fallback explanations.

## Run Server

```bash
python main.py
```

Server runs on http://127.0.0.1:8000

## API Documentation

Interactive docs available at http://127.0.0.1:8000/docs

## Enhanced Endpoints

### GET /
Get API information and available endpoints with new LLM features.

### GET /products/{product_id}
Get product details including title, category, price, rating.

### GET /products/{product_id}/related
Get related products based on user co-occurrence patterns.

### GET /users/{user_id}
Get user information and interaction history.

### GET /recommendations/{user_id}
Get personalized recommendations with AI explanations.

**New Parameters:**
- `use_llm`: Enable/disable LLM explanations (default: true)
- `limit`: Number of recommendations (1-20, default: 5)

**Example:**
```bash
curl "http://127.0.0.1:8000/recommendations/USER_ID?limit=3&use_llm=true"
```

### POST /llm/explain
Generate LLM explanations for any set of recommendations.

**Request Body:**
```json
{
  "user_id": "string",
  "recommendations": [
    {
      "product_id": "string",
      "title": "string", 
      "category": "string",
      "rating": 4.5
    }
  ],
  "user_history": [
    {
      "title": "string",
      "category": "string"
    }
  ]
}
```

### GET /llm/status
Check LLM service availability and configuration.

### GET /health
Check API and all service status including LLM integration.

## Example Enhanced Response

```json
{
  "user_id": "AHMNA5UK3V66O2V3DZSBJA4FYMOA",
  "strategy": "fallback",
  "recommendations": [
    {
      "product_id": "B01K8B8YA8",
      "title": "Echo Dot Smart Speaker", 
      "category": "Amazon Devices",
      "price": "49.99",
      "rating": 4.5,
      "confidence": 0.5,
      "explanation": "Recommended smart device that complements your tech preferences."
    }
  ]
}
```

## Directory Structure

```
05_backend/
├── app/
│   ├── main.py              # FastAPI app with LLM integration
│   ├── models/
│   │   └── schemas.py       # Pydantic models
│   ├── routers/
│   │   ├── products.py      # Product endpoints
│   │   ├── users.py         # User endpoints
│   │   ├── recommendations.py # Enhanced recommendation endpoints
│   │   └── llm.py           # LLM explanation endpoints
│   └── services/
│       ├── db.py            # Database queries
│       ├── recommendations.py # Enhanced recommendation logic
│       ├── llm_integration.py # Groq API integration
│       └── hybrid_recommender.py # ML model integration
├── main.py                  # Server entry point
├── requirements.txt         # Dependencies
├── .env                     # Environment configuration
└── README.md               # This file
```

## LLM Integration Details

- **API Provider**: Groq API (fast, free-tier available)
- **Model**: mixtral-8x7b-32768 for high-quality explanations
- **Fallback Strategy**: Intelligent context-aware explanations when API unavailable
- **Context Awareness**: Uses user history to personalize explanations
- **Performance**: Cached explanations and optimized prompts