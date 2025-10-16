# Cirquix Frontend

A modern React frontend for the Cirquix e-commerce recommendation system, built with Vite and Tailwind CSS.

## Features

- **User Authentication**: Simple login system with demo user IDs
- **Product Catalog**: Responsive product grid with search and filtering
- **Product Details**: Detailed product pages with specifications
- **Personalized Recommendations**: AI-powered product recommendations with explanations
- **Responsive Design**: Mobile-first design that works on all devices
- **Modern UI**: Clean, professional interface inspired by Best Buy

## Tech Stack

- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **Axios** - HTTP client for API calls

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── common/         # Shared components
│   ├── products/       # Product-related components
│   └── recommendations/ # Recommendation components
├── context/            # React context providers
├── pages/              # Page components
├── services/           # API services
├── utils/              # Utility functions
├── App.jsx             # Main app component
└── main.jsx            # Application entry point
```

## API Integration

The frontend communicates with the FastAPI backend through the following endpoints:

- `GET /users/{user_id}` - User validation and info
- `GET /products` - Product catalog with pagination
- `GET /products/{product_id}` - Product details
- `GET /recommendations/{user_id}` - Personalized recommendations

## Environment Configuration

The Vite configuration includes a proxy to the backend API:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:8000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

## Demo Users

The application includes several demo user IDs for testing:
- AHMNA5UK3V66O2V3DZSBJA4FYMOA (248 interactions)
- AECTQQX663PTF5UQ2RA5TUL3BXVQ (222 interactions)
- AEIIRIHLIYKQGI7ZOCIJTRDF5NPQ (212 interactions)
- AGRHKDNSRJ3CT5ST75KGSCD4WA5A (142 interactions)
- AG73BVBKUOH22USSFJA5ZWL7AKXA (137 interactions)

## Responsive Design

The interface is optimized for:
- **Desktop**: Full-featured experience with sidebar and detailed layouts
- **Tablet**: Adapted grid layouts and touch-friendly interfaces  
- **Mobile**: Streamlined navigation and stacked layouts

## Accessibility Features

- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
- High contrast colors
- Focus indicators

## Development

To extend the frontend:

1. **Add new components** in the appropriate `components/` subdirectory
2. **Create new pages** in the `pages/` directory
3. **Add API methods** in `services/api.js`
4. **Add utility functions** in `utils/helpers.js`
5. **Update routing** in `App.jsx`

## Performance Optimizations

- Component-level code splitting with React.lazy (planned)
- Image lazy loading and optimization
- Debounced search inputs
- Efficient pagination
- Memoized expensive computations