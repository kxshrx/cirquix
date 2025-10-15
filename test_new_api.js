// Test script to verify the new API endpoints
const API_BASE = 'http://127.0.0.1:8000';

async function testProductsAPI() {
    console.log('Testing Products API...');
    
    try {
        // Test products catalog
        const productsResponse = await fetch(`${API_BASE}/products/?limit=5`);
        const productsData = await productsResponse.json();
        console.log('✅ Products catalog:', {
            total: productsData.total,
            products_count: productsData.products.length,
            first_product: productsData.products[0]?.title
        });
        
        // Test categories
        const categoriesResponse = await fetch(`${API_BASE}/products/categories`);
        const categories = await categoriesResponse.json();
        console.log('✅ Categories:', {
            count: categories.length,
            sample: categories.slice(0, 5)
        });
        
        // Test specific product
        const productId = productsData.products[0]?.product_id;
        if (productId) {
            const productResponse = await fetch(`${API_BASE}/products/${productId}`);
            const product = await productResponse.json();
            console.log('✅ Individual product:', {
                id: product.product_id,
                title: product.title,
                category: product.category,
                rating: product.rating
            });
        }
        
        console.log('🎉 All API tests passed!');
        
    } catch (error) {
        console.error('❌ API test failed:', error);
    }
}

// Run the test
testProductsAPI();