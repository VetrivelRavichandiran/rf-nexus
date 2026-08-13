from pydantic import BaseModel
from typing import Optional, Dict, Any

class TargetPerformance(BaseModel):
    freq: float
    gain: float
    directivity: float
    s11: float
    radEff: float
    totalEff: float
    vswr: float

class GenerationRequest(BaseModel):
    target_performance: TargetPerformance
    substrate: str = "FR4"

class GeneratedDesign(BaseModel):
    patchW: str
    patchL: str
    feedW: str
    slot1W: str
    slot1L: str
    slot2W: str
    subW: str = "60.00"
    subL: str = "60.00"
    confidence: float = 98.5

# --- FIXED EXPORT REQUEST ---
class ExportRequest(BaseModel):
    format: str
    # This was missing! It allows the backend to receive the AI data from the frontend
    dimensions: Optional[Dict[str, Any]] = None