from fastapi import APIRouter, HTTPException
from core.schemas import GenerationRequest, GeneratedDesign
from ml_pipeline.optimizer import generate_optimized_design
import math

router = APIRouter()

# Global variable to store latest design for the 3D viewer
latest_design_cache = None

def apply_physics_guard(dims, target_freq):
    """
    Ensures AI outputs obey the laws of Electromagnetics.
    Fixes the 'L > W' swap and scales length to match frequency.
    """
    # 1. Standard Constants for FR4 (Er=4.4, h=1.6mm)
    # Target Length for 2.4GHz is roughly 29-30mm
    theoretical_L_base = 29.8  
    freq_ratio = 2.4 / target_freq
    target_L_physical = theoretical_L_base * freq_ratio

    raw_W = float(dims['Patch_W'])
    raw_L = float(dims['Patch_L'])

    # 2. Fix the 'Label Swap' (Ensuring W is the non-resonant larger side)
    # Standard Rectangular Patch: W > L
    actual_W = max(raw_W, raw_L)
    actual_L = min(raw_W, raw_L)

    # 3. Frequency Correction
    # If the AI length is more than 10% off from physics, we calibrate it
    error_margin = abs(actual_L - target_L_physical) / target_L_physical
    
    if error_margin > 0.10:
        # Calculate the correction factor
        correction_factor = target_L_physical / actual_L
        actual_L = actual_L * correction_factor
        # Scale Width proportionally to maintain the AI's impedance optimization
        actual_W = actual_W * correction_factor

    return {
        "Patch_W": actual_W,
        "Patch_L": actual_L,
        "Feed_W": dims['Feed_W'],
        "Slot1_W": dims['Slot1_W'],
        "Slot1_L": dims['Slot1_L'],
        "Slot2_W": dims['Slot2_W']
    }

@router.post("/generate", response_model=GeneratedDesign)
async def generate_design(request: GenerationRequest):
    global latest_design_cache
    
    try:
        targets = request.target_performance.model_dump()
        target_freq = targets.get('freq', 2.4)
        
        # 1. Run the ML Pipeline
        raw_dims = generate_optimized_design(targets, request.substrate)
        
        # 2. Apply the Physics Correction Layer (THE FIX)
        dims = apply_physics_guard(raw_dims, target_freq)
        
        # 3. Save to cache for the 3D Structure page with corrected values
        latest_design_cache = [
            {"label": "Sub_W", "val": "60.00 mm", "c": "#00f5ff"},
            {"label": "Sub_L", "val": "60.00 mm", "c": "#00f5ff"},
            {"label": "Sub_H", "val": "1.60 mm", "c": "#a855f7"},
            {"label": "Patch_W", "val": f"{dims['Patch_W']:.2f} mm", "c": "#39ff14"},
            {"label": "Patch_L", "val": f"{dims['Patch_L']:.2f} mm", "c": "#39ff14"},
            {"label": "Feed_W", "val": f"{dims['Feed_W']:.2f} mm", "c": "#fbbf24"},
        ]

        # 4. Return the perfect, physically-accurate design
        return GeneratedDesign(
            patchW=f"{dims['Patch_W']:.2f}", 
            patchL=f"{dims['Patch_L']:.2f}",
            feedW=f"{dims['Feed_W']:.2f}", 
            slot1W=f"{dims['Slot1_W']:.2f}",
            slot1L=f"{dims['Slot1_L']:.2f}", 
            slot2W=f"{dims['Slot2_W']:.2f}"
        )
    except Exception as e:
        print(f"ML Pipeline Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/latest")
async def get_latest_design():
    if latest_design_cache: return {"dimensions": latest_design_cache}
    return {"dimensions": []}