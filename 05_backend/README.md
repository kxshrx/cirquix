# E-commerce Recommendation API

FastAPI backend for serving product recommendations and metadata.

## Setup

```bash
cd 05_backend
pip install -r requirements.txt
```

## Run Server

```bash
python main.py
```

Server runs on http://127.0.0.1:8000

## API Documentation

Interactive docs available at http://127.0.0.1:8000/docs

## Endpoints

### GET /products/{product_id}
Get product details including title, category, price, rating.

### GET /products/{product_id}/related
Get related products based on user co-occurrence patterns.

### GET /users/{user_id}
Get user information and interaction history.

### GET /recommendations/{user_id}
Get personalized recommendations with confidence scores and explanations.

### GET /health
Check API and recommendation service status.

## Directory Structure

```
05_backend/
├── app/
│   ├── main.py              # FastAPI app setup
│   ├── models/
│   │   └── schemas.py       # Pydantic models
│   ├── routers/
│   │   ├── products.py      # Product endpoints
│   │   ├── users.py         # User endpoints
│   │   └── recommendations.py # Recommendation endpoints
│   └── services/
│       ├── db.py            # Database queries
│       ├── recommendations.py # Recommendation logic
│       └── hybrid_recommender.py # ML model integration
├── main.py                  # Server entry point
└── requirements.txt         # Dependencies
```