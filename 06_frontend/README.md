# E-commerce Recommendation Frontend

Modern, responsive React frontend for the e-commerce recommendation system with AI-powered explanations.

## Features

- 🛍️ **Product Browsing**: Select and view product details with metadata
- 🤖 **AI Recommendations**: Get personalized recommendations with LLM explanations
- 👤 **User Simulation**: Switch between different user profiles for testing
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- ⚡ **Real-time Updates**: Live API status monitoring and error handling
- 🎨 **Modern UI**: Clean, professional design with loading states

## Quick Start

### Prerequisites

- Node.js 16+ 
- Backend API running on `http://127.0.0.1:8000`

### Installation

```bash
cd 06_frontend
npm install
```

### Environment Setup

```bash
cp .env.example .env
# Edit .env to configure your backend API URL
```

### Development

```bash
npm run dev
```

Runs the app at http://localhost:5173

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
06_frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ProductCard.jsx   # Product display component
│   │   ├── UserSelector.jsx  # User selection dropdown
│   │   ├── ProductSelector.jsx # Product search/selection
│   │   └── RecommendationList.jsx # Recommendations grid
│   ├── pages/
│   │   └── ProductPage.jsx   # Main application page
│   ├── api/
│   │   └── api.js           # Backend API integration
│   ├── styles/
│   │   └── globals.css      # Global styles and utilities
│   ├── App.jsx              # Main app with routing
│   └── main.jsx             # App entry point
├── public/                  # Static assets
├── .env.example            # Environment configuration template
└── package.json            # Dependencies and scripts
```

## API Integration

The frontend connects to your FastAPI backend and provides:

### Automatic Features
- Health monitoring of backend and LLM services
- Error handling and fallback states
- Loading indicators for all API calls
- Responsive error messages

### Demo Data
- Sample user IDs for testing different scenarios
- Sample product IDs from the Electronics dataset
- Cold-start user simulation
- Custom user/product ID input

## User Experience

### Getting Started Flow
1. **Select User**: Choose from sample users or enter custom user ID
2. **Select Product**: Pick sample product or enter custom product ID
3. **View Details**: See product information and metadata
4. **Get Recommendations**: View AI-powered recommendations with explanations
5. **Explore**: Click recommended products to drill down

### User Types
- **Active Users**: Users with purchase history (personalized recommendations)
- **Cold Start Users**: New users (popularity-based recommendations)
- **Custom Users**: Any user ID for testing

### Product Features
- Product metadata display (title, category, price, rating)
- Image placeholders for missing images
- AI-generated recommendation explanations
- Confidence scores for recommendations

## Customization

### Styling
- Modern CSS with utility classes
- Responsive grid layouts
- Professional color scheme
- Accessible design patterns

### API Configuration
- Environment-based API URL configuration
- Configurable request timeouts
- Error handling strategies

### Demo Configuration
- Customizable sample data
- Adjustable recommendation limits
- LLM explanation toggle

## Deployment

### Environment Variables
```bash
VITE_API_BASE_URL=https://your-backend-domain.com
```

### Build Commands
```bash
npm run build
```

### Hosting
- Deploy the `dist/` folder to any static hosting service
- Ensure backend CORS is configured for your domain
- Update API URLs for production environment

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Key Dependencies
- **React 18** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Lucide React** - Modern icon library
- **Vite** - Fast build tool and dev server

## Troubleshooting

### Common Issues

**API Connection Failed**
- Verify backend is running on correct port
- Check CORS configuration in FastAPI
- Confirm .env file has correct API URL

**No Recommendations Showing**
- Verify user exists in database
- Check product ID is valid
- Monitor browser console for API errors

**LLM Explanations Missing**
- Check LLM service status in the UI
- Verify Groq API key in backend
- System automatically falls back to contextual explanations

### Development Tips
- Use browser dev tools to monitor API calls
- Check console for detailed error messages
- API status indicators show service health
- Sample data provides known working IDs

## Features Showcase

This frontend demonstrates:
- Modern React development patterns
- Professional UI/UX design
- Robust error handling
- Mobile-responsive layouts
- Real-time API monitoring
- AI-powered recommendation explanations
- Seamless user experience flows

Perfect for showcasing your e-commerce recommendation system to stakeholders, recruiters, or in technical demonstrations!

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
