import os
import sys

# --- 1. SYSTEM BOOTSTRAP (EXE CONFIG) ---
if getattr(sys, 'frozen', False):
    bundle_dir = os.path.dirname(sys.executable)
    internal_dir = os.path.join(bundle_dir, "_internal")
    
    # Priority Pathing: Ensures the EXE uses bundled libraries over system ones
    sys.path.insert(0, internal_dir)
    sys.path.insert(0, bundle_dir)
    
    os.environ["PYTHONPATH"] = internal_dir
    # Reduce TensorFlow logging noise (0 = all, 1 = no info, 2 = no warnings, 3 = no errors)
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# --- 2. CORE IMPORTS ---
try:
    import tensorflow as tf
    import uvicorn
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse
    
    # Critical for .h5 model stability in a bundled environment
    from tensorflow.python.keras.utils.generic_utils import CustomObjectScope

    # Project API Routes
    from api.routes_design import router as design_router
    from api.routes_analyze import router as analyze_router
    from api.routes_export import router as export_router
except ImportError as e:
    print(f"❌ Startup Import Error: {e}")
    sys.exit(1)

# --- 3. FASTAPI APP SETUP ---
app = FastAPI(title="RF-NEXUS Titan ML Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(design_router, prefix="/api/v1/design")
app.include_router(analyze_router, prefix="/api/v1/analyze")
app.include_router(export_router, prefix="/api/v1/export")

def get_resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller EXE """
    try:
        return os.path.join(sys._MEIPASS, relative_path)
    except Exception:
        return os.path.join(os.path.abspath("."), relative_path)

# --- 4. FRONTEND SERVING ---
frontend_dir = get_resource_path("dist")
if os.path.exists(frontend_dir):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dir, "assets")), name="static")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        if full_path.startswith("api/"):
            return {"error": "Not Found"}
        return FileResponse(os.path.join(frontend_dir, "index.html"))

# --- 5. ENGINE START ---
if __name__ == "__main__":
    print("\n" + "="*50)
    print("🚀 RF-NEXUS TITAN: SYSTEM INITIALIZATION")
    print("="*50)
    
    # Wrap server in CustomObjectScope to allow model re-hydration
    with CustomObjectScope({}):
        print("🔥 Titan Engine Active. Starting Uvicorn at http://127.0.0.1:8000")
        uvicorn.run(app, host="127.0.0.1", port=8000, reload=False, workers=1)