// Test script to verify all API endpoints are working
const BASE_URL = 'http://127.0.0.1:8000';

async function testEndpoints() {
  console.log('🔍 Testing API Endpoints...\n');

  // Test health endpoint
  try {
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
  }

  // Test product endpoint
  try {
    const productResponse = await fetch(`${BASE_URL}/products/B01K8B8YA8`);
    const productData = await productResponse.json();
    console.log('✅ Product API:', {
      id: productData.product_id,
      title: productData.title,
      category: productData.category,
      price: productData.price
    });
  } catch (error) {
    console.log('❌ Product API Failed:', error.message);
  }

  // Test recommendations endpoint
  const testUserId = 'AHMNA5UK3V66O2V3DZSBJA4FYMOA';
  try {
    const recsResponse = await fetch(`${BASE_URL}/recommendations/${testUserId}?limit=3&use_llm=true`);
    const recsData = await recsResponse.json();
    console.log('✅ Recommendations API:', {
      user_id: recsData.user_id,
      strategy: recsData.strategy,
      count: recsData.recommendations.length,
      first_rec: recsData.recommendations[0] ? {
        product_id: recsData.recommendations[0].product_id,
        title: recsData.recommendations[0].title,
        has_explanation: !!recsData.recommendations[0].explanation
      } : null
    });
  } catch (error) {
    console.log('❌ Recommendations API Failed:', error.message);
  }

  // Test related products endpoint
  try {
    const relatedResponse = await fetch(`${BASE_URL}/products/B01K8B8YA8/related?limit=3`);
    const relatedData = await relatedResponse.json();
    console.log('✅ Related Products API:', {
      count: relatedData.length,
      products: relatedData.map(p => ({ id: p.product_id, title: p.title }))
    });
  } catch (error) {
    console.log('❌ Related Products API Failed:', error.message);
  }

  console.log('\n🎉 API Testing Complete!');
}

// Run in Node.js environment
if (typeof require !== 'undefined') {
  const fetch = require('node-fetch');
  testEndpoints();
} else {
  // Run in browser
  testEndpoints();
}