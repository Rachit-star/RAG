"""
Thin wrapper around the paper-analyst FastAPI app.
Adds CORS middleware so the Next.js dev server (port 3000) can call the API.
Does NOT modify any files inside paper-analyst/.
"""

import sys
import os

# Add paper-analyst to the Python path so its imports resolve
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "paper-analyst"))

# Change working directory so relative paths (chroma_data, papers) still work
os.chdir(os.path.join(os.path.dirname(__file__), "paper-analyst"))

from main import app  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
