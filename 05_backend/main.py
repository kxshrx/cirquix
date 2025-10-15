import uvicorn
import os
import sys
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent / "app"))

if __name__ == "__main__":
    # Change to the backend directory
    os.chdir(Path(__file__).parent)
    
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )