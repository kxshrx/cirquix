"""
Add image URLs to the products table from metadata
Extracts the first large image URL from the metadata JSONL file
"""

import sqlite3
import json
import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent.parent
DB_PATH = BASE_DIR / "03_database_setup" / "recommendation.db"
METADATA_PATH = BASE_DIR / "raw" / "meta_Electronics.jsonl"

def add_image_column():
    """Add image_url column to products table if it doesn't exist"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if column already exists
        cursor.execute("PRAGMA table_info(products)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'image_url' not in columns:
            print("Adding image_url column to products table...")
            cursor.execute("ALTER TABLE products ADD COLUMN image_url TEXT")
            conn.commit()
            print("✓ Column added successfully")
        else:
            print("✓ image_url column already exists")
    
    except Exception as e:
        print(f"✗ Error adding column: {e}")
        conn.rollback()
    finally:
        conn.close()


def load_metadata_images():
    """Load product images from metadata JSONL"""
    print(f"\nLoading image URLs from {METADATA_PATH}...")
    
    if not os.path.exists(METADATA_PATH):
        print(f"✗ Metadata file not found: {METADATA_PATH}")
        return {}
    
    image_map = {}
    line_count = 0
    image_count = 0
    
    try:
        with open(METADATA_PATH, 'r', encoding='utf-8') as f:
            for line in f:
                line_count += 1
                try:
                    data = json.loads(line.strip())
                    parent_asin = data.get('parent_asin')
                    images = data.get('images', [])
                    
                    if parent_asin and images:
                        # Get the first image's large URL
                        for img in images:
                            if img.get('large'):
                                image_map[parent_asin] = img['large']
                                image_count += 1
                                break
                            # Fallback to thumb if large not available
                            elif img.get('thumb'):
                                image_map[parent_asin] = img['thumb']
                                image_count += 1
                                break
                
                except json.JSONDecodeError:
                    continue
                
                if line_count % 1000 == 0:
                    print(f"  Processed {line_count} lines, found {image_count} images...")
        
        print(f"✓ Loaded {image_count} image URLs from {line_count} metadata records")
        return image_map
    
    except Exception as e:
        print(f"✗ Error loading metadata: {e}")
        return {}


def update_product_images(image_map):
    """Update products table with image URLs"""
    print("\nUpdating products table with image URLs...")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Get all product IDs
        cursor.execute("SELECT product_id FROM products")
        products = cursor.fetchall()
        total_products = len(products)
        
        updated_count = 0
        batch_size = 1000
        updates = []
        
        for i, (product_id,) in enumerate(products, 1):
            if product_id in image_map:
                updates.append((image_map[product_id], product_id))
                updated_count += 1
            
            # Batch update
            if len(updates) >= batch_size or i == total_products:
                cursor.executemany(
                    "UPDATE products SET image_url = ? WHERE product_id = ?",
                    updates
                )
                conn.commit()
                updates = []
                
                if i % 1000 == 0 or i == total_products:
                    print(f"  Updated {i}/{total_products} products ({updated_count} with images)...")
        
        print(f"✓ Updated {updated_count} products with image URLs")
        
        # Verify update
        cursor.execute("SELECT COUNT(*) FROM products WHERE image_url IS NOT NULL")
        count_with_images = cursor.fetchone()[0]
        print(f"✓ Total products with images: {count_with_images}")
        
    except Exception as e:
        print(f"✗ Error updating products: {e}")
        conn.rollback()
    finally:
        conn.close()


def verify_images():
    """Verify image URLs were added correctly"""
    print("\nVerifying image URL updates...")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Count products with and without images
        cursor.execute("SELECT COUNT(*) FROM products")
        total = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM products WHERE image_url IS NOT NULL AND image_url != ''")
        with_images = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM products WHERE image_url IS NULL OR image_url = ''")
        without_images = cursor.fetchone()[0]
        
        print(f"\n{'='*60}")
        print(f"Total products: {total}")
        print(f"Products with images: {with_images} ({with_images/total*100:.1f}%)")
        print(f"Products without images: {without_images} ({without_images/total*100:.1f}%)")
        print(f"{'='*60}")
        
        # Show sample products with images
        cursor.execute("""
            SELECT product_id, title, image_url 
            FROM products 
            WHERE image_url IS NOT NULL 
            LIMIT 3
        """)
        
        print("\nSample products with images:")
        for product_id, title, image_url in cursor.fetchall():
            print(f"  • {product_id}")
            print(f"    Title: {title[:60]}...")
            print(f"    Image: {image_url}")
            print()
    
    except Exception as e:
        print(f"✗ Error verifying: {e}")
    finally:
        conn.close()


def main():
    """Main execution function"""
    print("="*60)
    print("Adding Product Image URLs to Database")
    print("="*60)
    
    # Step 1: Add column if needed
    add_image_column()
    
    # Step 2: Load image URLs from metadata
    image_map = load_metadata_images()
    
    if not image_map:
        print("✗ No images loaded. Exiting.")
        return
    
    # Step 3: Update products table
    update_product_images(image_map)
    
    # Step 4: Verify results
    verify_images()
    
    print("\n✓ Image URL update complete!")


if __name__ == "__main__":
    main()
