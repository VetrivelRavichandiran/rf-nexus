import os
import sys
import numpy as np
import importlib

def titan_final_check():
    print("--- 🛰️ TITAN PATH & BINARY DIAGNOSTIC ---")
    
    # 1. Correct Path Discovery
    # Since you are in E:\RF\backend, we go up one level to find .venv
    root_path = os.path.dirname(os.getcwd())
    venv_site = os.path.join(root_path, '.venv', 'Lib', 'site-packages')
    ml_folder = os.path.join(venv_site, 'ml_dtypes')
    
    print(f"📂 Searching for binaries in: {ml_folder}")
    
    if os.path.exists(ml_folder):
        pyd_files = [f for f in os.listdir(ml_folder) if f.endswith('.pyd')]
        print(f"✅ Found Binaries: {pyd_files}")
    else:
        print("❌ ERROR: Path not found. Check if .venv is in E:/RF/")
        return

    # 2. The "Import Order" Test
    print("\n🧪 Testing Import Handshake...")
    try:
        # We try to import ml_dtypes BEFORE anything else touches the C-API
        import ml_dtypes
        print("✅ ml_dtypes imported.")
        
        # Check if float4 is registered
        try:
            dt = np.dtype('float4_e2m1fn')
            print(f"🌟 SUCCESS: float4_e2m1fn is REGISTERED in NumPy.")
        except TypeError:
            print("⚠️ FAILED: float4_e2m1fn is NOT REGISTERED.")
            
            # Check for alternative names (some versions use different naming)
            for test_name in ['int4', 'uint4', 'bfloat16']:
                try:
                    np.dtype(test_name)
                    print(f"ℹ️ Found alternative type: {test_name}")
                except: pass
                
    except Exception as e:
        print(f"💥 Import Error: {e}")

if __name__ == "__main__":
    titan_final_check()