import { useState, useEffect } from 'react';
import { Search, Package } from 'lucide-react';
import apiService from '../api/api';

const ProductSelector = ({ selectedProduct, onProductChange, onLoadProduct }) => {
  const [products, setProducts] = useState([]);
  const [customProduct, setCustomProduct] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSampleProducts = async () => {
      try {
        const data = await apiService.getSampleData();
        setProducts(data.sampleProducts);
        
        // Set default product if none selected
        if (!selectedProduct && data.defaultProduct) {
          onProductChange(data.defaultProduct);
        }
      } catch (error) {
        console.error('Failed to load sample products:', error);
        // Fallback sample products
        const fallbackProducts = [
          'B01K8B8YA8',
          'B075F9K5B9',
          'B07DJKXH8D'
        ];
        setProducts(fallbackProducts);
        if (!selectedProduct) {
          onProductChange(fallbackProducts[0]);
        }
      }
    };

    loadSampleProducts();
  }, [selectedProduct, onProductChange]);

  const handleProductTypeChange = (e) => {
    const useCustom = e.target.value === 'custom';
    setIsCustom(useCustom);
    
    if (!useCustom && products.length > 0) {
      onProductChange(products[0]);
      setCustomProduct('');
    }
  };

  const handleProductSelect = (e) => {
    const productId = e.target.value;
    if (productId) {
      onProductChange(productId);
    }
  };

  const handleCustomProductChange = (e) => {
    const productId = e.target.value;
    setCustomProduct(productId);
    onProductChange(productId.trim());
  };

  const handleLoadProduct = async () => {
    if (!selectedProduct) return;
    
    setLoading(true);
    try {
      await onLoadProduct(selectedProduct);
    } catch (error) {
      console.error('Failed to load product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
      <div className="flex items-center gap-2 mb-3">
        <Package size={20} />
        <h3 className="font-semibold">Product Selection</h3>
      </div>
      
      <div className="form-group">
        <label className="label">Product Type:</label>
        <select 
          className="select mb-3" 
          onChange={handleProductTypeChange}
          value={isCustom ? 'custom' : 'sample'}
        >
          <option value="sample">Sample Products</option>
          <option value="custom">Custom Product ID</option>
        </select>
      </div>

      {isCustom ? (
        <div className="form-group">
          <label className="label">Enter Product ID:</label>
          <input
            type="text"
            className="input"
            placeholder="Enter product ID (e.g., B01K8B8YA8)..."
            value={customProduct}
            onChange={handleCustomProductChange}
          />
          <p className="text-sm text-gray-500 mt-1">
            Enter any product ID from your Amazon Electronics dataset
          </p>
        </div>
      ) : (
        <div className="form-group">
          <label className="label">Select Sample Product:</label>
          <select 
            className="select" 
            value={selectedProduct || ''} 
            onChange={handleProductSelect}
          >
            {products.map(productId => (
              <option key={productId} value={productId}>
                {productId}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            These are sample product IDs from the Electronics dataset
          </p>
        </div>
      )}

      <div className="flex gap-2 mt-3">
        <button 
          className="btn btn-primary flex-1"
          onClick={handleLoadProduct}
          disabled={!selectedProduct || loading}
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              Loading...
            </>
          ) : (
            <>
              <Search size={16} />
              Load Product & Recommendations
            </>
          )}
        </button>
      </div>

      {selectedProduct && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-700">
            <strong>Current Product:</strong> {selectedProduct}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductSelector;