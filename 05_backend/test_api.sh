#!/bin/bash

# FastAPI Backend API Test Script

echo "=== E-commerce Recommendation API Test ==="
echo ""

API_BASE="http://127.0.0.1:8000"

echo "1. Testing Root Endpoint..."
curl -s "$API_BASE/" | jq .
echo ""

echo "2. Testing Health Check..."
curl -s "$API_BASE/health" | jq .
echo ""

echo "3. Testing Product Endpoint..."
curl -s "$API_BASE/products/B01K8B8YA8" | jq .
echo ""

echo "4. Testing Related Products..."
curl -s "$API_BASE/products/B01K8B8YA8/related?limit=3" | jq .
echo ""

echo "5. Testing User Info..."
curl -s "$API_BASE/users/AHMNA5UK3V66O2V3DZSBJA4FYMOA" | jq 'del(.history)' 
echo ""

echo "6. Testing User Recommendations..."
curl -s "$API_BASE/recommendations/AHMNA5UK3V66O2V3DZSBJA4FYMOA?limit=3" | jq .
echo ""

echo "7. Testing Cold Start User..."
curl -s "$API_BASE/recommendations/TEST_COLD_USER_123?limit=3" | jq .
echo ""

echo "8. Testing Error Handling - Invalid Product..."
curl -s "$API_BASE/products/INVALID_PRODUCT_ID"
echo ""

echo "9. Testing Error Handling - Invalid User..."
curl -s "$API_BASE/users/INVALID_USER_ID"
echo ""

echo "=== API Test Complete ==="