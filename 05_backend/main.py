import uvicorn
import os
import sys
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent / "app"))

if __name__ == "__main__":
    # Change to the backend directory
    os.chdir(Path(__file__).parent)
    
    # Get port from environment variable (for Render) or default to 8000
    port = int(os.environ.get("PORT", 8000))
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",  # Allow external connections (required for Render)
        port=port,
        reload=False  # Disable reload in production
    )