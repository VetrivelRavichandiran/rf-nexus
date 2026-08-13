from fastapi import APIRouter
from data_services.visual_prep import generate_s11_curve
from data_services.dataset_manager import dataset_manager

router = APIRouter()

@router.get("/s11")
async def get_s11_data():
    return generate_s11_curve(center_freq=2.4) # Could be made dynamic later

@router.get("/performance")
async def get_performance_analysis():
    # Returns the payload the Analysis.jsx file expects
    return {
        "radar": [
            {"param": "Gain", "A": 85, "B": 80}, {"param": "Directivity", "A": 92, "B": 90},
            {"param": "Rad Eff", "A": 96, "B": 90}, {"param": "Total Eff", "A": 89, "B": 85},
            {"param": "S11", "A": 98, "B": 90}, {"param": "Bandwidth", "A": 75, "B": 70}
        ]
    }

@router.get("/stats") # For Dashboard.jsx
async def get_dashboard_stats():
    # In production, this can merge realtime ML data with Dataset stats
    return {"status": "active", "dataset_info": dataset_manager.get_basic_stats()}