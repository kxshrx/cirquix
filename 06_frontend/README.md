# CircuiX - E-commerce Recommendation Frontend

Modern, Amazon-like e-commerce frontend with AI-powered personalized recommendations, realistic user authentication, and comprehensive product catalog browsing.

## ✨ Features

- � **User Authentication**: Realistic login system with demo accounts and custom user IDs
- 🛍️ **Product Catalog**: Browse products with search, filtering, and sorting capabilities
- 🤖 **AI Recommendations**: Personalized recommendations with LLM-generated explanations
- � **Responsive Design**: Modern, mobile-first design that works on all devices
- 🎨 **Amazon-like UI**: Professional e-commerce interface with intuitive navigation
- ⚡ **Real-time Features**: Live API status monitoring and seamless navigation

## 🚀 Quick Start

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

## 🏗️ Project Structure

```
06_frontend/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── Login.jsx         # User authentication component
│   │   ├── Navigation.jsx    # Top navigation with search and categories
│   │   ├── ProductCard.jsx   # Product display (grid/list view)
│   │   ├── ProductCatalog.jsx # Product browsing with filters
│   │   └── RecommendationList.jsx # AI-powered recommendations
│   ├── pages/
│   │   ├── Homepage.jsx      # Main page with login and catalog
│   │   └── ProductDetail.jsx # Individual product pages
│   ├── api/
│   │   └── api.js           # Backend API integration
│   ├── styles/
│   │   └── globals.css      # Modern CSS with utilities
│   ├── App.jsx              # Main app with routing
│   └── main.jsx             # App entry point
├── .env.example            # Environment configuration template
└── package.json            # Dependencies and scripts
```

## 🎯 User Experience Flow

### 1. **Authentication**
- Choose from demo user accounts or enter custom user ID
- Automatic session persistence across browser refreshes
- Different user types for testing various recommendation scenarios

### 2. **Product Discovery**
- Browse comprehensive product catalog
- Search products by name or description
- Filter by categories (Amazon Devices, Electronics, etc.)
- Sort by rating, price, or name
- Switch between grid and list view modes

### 3. **Product Details**
- Detailed product pages with full information
- High-quality product imagery placeholders
- User ratings and pricing information
- Add to cart and wishlist functionality (UI only)

### 4. **AI Recommendations**
- Personalized recommendations based on user history
- LLM-generated explanations for each recommendation
- Confidence scores and recommendation strategies
- Related products from user behavior patterns

### 5. **Seamless Navigation**
- Click any recommended product to explore its details
- Maintain user session across all pages
- Responsive navigation with category filters
- Mobile-optimized interface

## 🛠️ Technical Features

### **Authentication System**
- Demo account selection for quick testing
- Custom user ID input for database exploration
- Persistent login sessions with localStorage
- Graceful handling of non-existent users

### **Search & Discovery**
- Real-time product search functionality
- Category-based filtering system
- Multiple sorting options (rating, price, name)
- Grid/list view toggle for user preference

### **API Integration**
- Comprehensive backend connectivity
- Intelligent fallback for missing data
- Error handling with user-friendly messages
- Loading states for all async operations

### **Responsive Design**
- Mobile-first approach with progressive enhancement
- Flexible grid layouts that adapt to screen size
- Touch-friendly navigation and interactions
- Optimized for tablets and desktop

## 🎨 Design System

### **Color Palette**
- Primary: Blue tones for actions and highlights
- Secondary: Gray scale for content and backgrounds
- Success: Green for positive states
- Warning: Orange/red for errors and attention

### **Typography**
- Inter font family for modern, readable text
- Hierarchical text sizing with proper contrast
- Accessible font weights and line heights

### **Components**
- Consistent card-based layouts
- Professional button styles with hover effects
- Form elements with focus states
- Loading spinners and error messages

## 🔧 API Integration

### **Endpoints Used**
- `GET /health` - API health status
- `GET /users/{id}` - User authentication
- `GET /products` - Product catalog (with search/filters)
- `GET /products/{id}` - Individual product details
- `GET /recommendations/{user_id}` - Personalized recommendations
- `GET /llm/status` - LLM service availability

### **Features**
- Automatic retry logic for failed requests
- Graceful degradation when services unavailable
- Real-time status indicators
- Intelligent caching for better performance

## 🧪 Demo Data

### **Sample Users**
- `AHMNA5UK3V66O2V3DZSBJA4FYMOA` - Active user with history
- `TEST_COLD_USER_123` - New user (cold start demo)
- `DEMO_USER_ACTIVE` - Demo user with preferences
- Custom user IDs - Test any user from your database

### **Product Categories**
- Amazon Devices
- Electronics
- Computers
- Home & Kitchen
- Sports & Outdoors

## 📱 Mobile Experience

### **Responsive Features**
- Collapsible navigation menu
- Touch-optimized product cards
- Swipe-friendly carousels
- Mobile search interface
- Thumb-friendly button sizing

### **Performance**
- Optimized image loading
- Efficient rendering for mobile devices
- Minimal data usage
- Fast page transitions

## 🚀 Deployment

### **Build for Production**
```bash
npm run build
```

### **Environment Variables**
```bash
VITE_API_BASE_URL=https://your-backend-domain.com
```

### **Hosting**
- Deploy the `dist/` folder to any static hosting service
- Configure backend CORS for your domain
- Update API URLs for production environment

## 🎯 Demo Scenarios

### **Showcase Features**
1. **User Personalization**: Login as different users to see varying recommendations
2. **Search Functionality**: Search for "smart" to see electronics products
3. **Category Filtering**: Browse Amazon Devices for smart home products
4. **AI Explanations**: View personalized explanations for each recommendation
5. **Product Discovery**: Click recommended products to explore catalog depth

### **Business Value**
- Demonstrates modern e-commerce UX patterns
- Showcases AI integration in consumer applications
- Highlights responsive design capabilities
- Proves full-stack development skills

## 🎨 Modern E-commerce Features

This frontend replicates key aspects of modern e-commerce platforms:

### **Amazon-like Navigation**
- Persistent header with search and categories
- Breadcrumb navigation for product discovery
- Professional typography and spacing

### **Product Discovery**
- High-quality product cards with essential information
- Intuitive filtering and sorting options
- Grid/list view modes for user preference

### **Personalization**
- AI-powered recommendation explanations
- User-specific product suggestions
- Confidence scoring for recommendations

### **Professional Polish**
- Loading states for all async operations
- Error handling with recovery options
- Consistent design language throughout
- Accessibility considerations

Perfect for showcasing modern front-end development skills, e-commerce UX design, and AI integration capabilities to potential employers, clients, or stakeholders! 🎯✨

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
