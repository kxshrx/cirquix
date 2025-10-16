# Cirquix

A production-ready e-commerce recommendation system combining collaborative filtering, content-based filtering, and large language model integration for personalized product recommendations with natural language explanations.

## Overview

Cirquix is an end-to-end recommendation platform built on the Amazon Electronics dataset, featuring a hybrid recommendation engine that serves personalized suggestions through a modern web interface. The system addresses cold start problems through intelligent fallback strategies and provides AI-generated explanations for each recommendation.

## Key Features

- Hybrid recommendation engine combining ALS collaborative filtering and popularity-based methods
- 100% user coverage with intelligent fallback strategies for cold start users
- LLM-powered natural language explanations for recommendations
- RESTful API built with FastAPI
- Modern React frontend with responsive design
- Optimized for performance with dense dataset filtering
- Production-ready deployment configuration

## System Architecture

### Backend Components

- **Database Layer**: SQLite database with optimized schema for fast queries
- **Recommendation Engine**: Hybrid system using ALS model with popularity and content-based fallbacks
- **API Layer**: FastAPI endpoints for products, users, and recommendations
- **LLM Integration**: Groq API integration for generating contextual explanations

### Frontend Components

- **React Application**: Modern single-page application built with Vite
- **Responsive UI**: Mobile-first design with Tailwind CSS
- **Product Catalog**: Browse and search functionality with filters
- **User Dashboard**: Personalized recommendations with AI explanations

## Project Structure

```
cirquix/
├── 01_metadata_processing/    # Data ingestion and CSV conversion pipeline
├── 02_data_preprocessing/      # Data exploration and dense dataset optimization
├── 03_database_setup/          # SQLite database schema and query helpers
├── 04_recommendation_model/    # Hybrid recommendation system and model artifacts
├── 05_backend/                 # FastAPI backend with LLM integration
├── 06_frontend/                # React frontend application
└── raw/                        # Original Amazon Electronics dataset files
```

## Technical Stack

### Backend
- Python 3.8+
- FastAPI for API framework
- SQLite for data storage
- Implicit library for ALS collaborative filtering
- Scikit-learn for data processing
- Groq API for LLM integration

### Frontend
- React 18
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- Axios for HTTP requests

### Data Processing
- Pandas for data manipulation
- NumPy for numerical operations
- Jupyter notebooks for analysis

## Getting Started

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- 8GB RAM minimum for model training
- Groq API key for LLM features (optional)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kxshrx/cirquix.git
cd cirquix
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Set up the database:
```bash
cd 03_database_setup
python 1_database_setup.py
```

4. Install frontend dependencies:
```bash
cd ../06_frontend
npm install
```

### Running the Application

1. Start the backend server:
```bash
cd 05_backend
python main.py
```
The API will be available at http://localhost:8000

2. Start the frontend development server:
```bash
cd 06_frontend
npm run dev
```
The application will be available at http://localhost:5173

### API Documentation

Interactive API documentation is available at http://localhost:8000/docs when the backend server is running.

## Data Pipeline

### Dataset Information

The system uses the Amazon Electronics dataset containing:
- 8.1 million user interactions (ratings and reviews)
- 1.6 million unique users
- 149,000 unique products
- Comprehensive product metadata including titles, categories, prices, and ratings

### Data Optimization

The preprocessing pipeline reduces the dataset to a dense, high-quality subset:
- 1.0 million interactions (87% reduction)
- 67,000 active users with 10+ interactions
- 16,600 popular products with 15+ user interactions
- 95% file size reduction while preserving recommendation quality
- 3x higher average user engagement

## Model Performance

The hybrid recommendation system achieves:
- 100% recommendation coverage for all users
- Optimized hit rate through data quality filtering
- Sub-second recommendation generation
- Confidence scores for recommendation ranking
- Graceful degradation for cold start scenarios

## API Endpoints

### Core Endpoints
- `GET /products/{product_id}` - Product details and metadata
- `GET /products/{product_id}/related` - Related product suggestions
- `GET /users/{user_id}` - User profile and interaction history
- `GET /recommendations/{user_id}` - Personalized recommendations with explanations

### LLM Endpoints
- `POST /llm/explain` - Generate explanations for recommendations
- `GET /llm/status` - Check LLM service availability

### Utility Endpoints
- `GET /health` - System health check
- `GET /` - API information and documentation

## Configuration

### Backend Configuration

Create a `.env` file in `05_backend/`:
```
GROQ_API_KEY=your_api_key_here
```

### Frontend Configuration

Create a `.env.production` file in `06_frontend/`:
```
VITE_API_URL=https://your-backend-url.com
```

## Deployment

### Backend Deployment

The backend is deployed on Render at https://cirquix.onrender.com

Deployment steps:
1. Configure environment variables in Render dashboard
2. Set Python version to 3.8+
3. Set build command: `cd 05_backend && pip install -r requirements.txt`
4. Set start command: `cd 05_backend && python main.py`

### Frontend Deployment

The frontend can be deployed to Netlify, Vercel, or similar platforms:
1. Build the production bundle: `npm run build`
2. Deploy the `dist` directory
3. Configure API URL in environment variables

## Development Workflow

### Adding New Features

1. Update data processing scripts in `01_metadata_processing/` or `02_data_preprocessing/`
2. Modify database schema in `03_database_setup/` if needed
3. Update recommendation logic in `04_recommendation_model/`
4. Add API endpoints in `05_backend/app/routers/`
5. Update frontend components in `06_frontend/src/`

### Testing

Run backend tests:
```bash
cd 05_backend
pytest
```

Test frontend components:
```bash
cd 06_frontend
npm test
```

## Performance Optimization

### Database Optimization
- Indexed queries for fast lookups
- Dense dataset reduces query complexity
- Optimized schema for recommendation patterns

### Model Optimization
- Pre-computed similarity matrices
- Cached popularity rankings
- Efficient user-item matrix operations

### API Optimization
- Response caching for frequent queries
- Fallback strategies to minimize latency
- Asynchronous LLM calls

## Known Limitations

- Recommendations limited to products in the training dataset
- LLM explanations depend on API availability and rate limits
- Cold start users receive popularity-based recommendations
- Model requires periodic retraining for new products and users

## Future Enhancements

- Real-time model updates with online learning
- Advanced content-based filtering using product descriptions
- A/B testing framework for recommendation strategies
- Performance monitoring and analytics dashboard
- Multi-armed bandit algorithms for exploration-exploitation balance
- Graph-based recommendations using user-product networks

## License

This project is licensed under the MIT License.

## Authors

Developed by Kaushar

## Acknowledgments

- Amazon Electronics dataset from Amazon Review Data (2023)
- Implicit library for efficient ALS implementation
- Groq for fast LLM inference
- FastAPI and React communities for excellent documentation

## Contact

For questions or support, please open an issue on the GitHub repository.
