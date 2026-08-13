import os
import sys
import ctypes
import numpy as np

def test_ml_dtypes_fix():
    print("🔍 Testing ml_dtypes binary status...")
    
    # 1. Check if ml_dtypes is already broken
    try:
        from ml_dtypes import float4_e2m1fn
        print("✅ SUCCESS: float4_e2m1fn imported directly.")
        return
    except (ImportError, AttributeError):
        print("❌ FAILED: Direct import failed (Expected if not fixed yet).")

    # 2. Simulate the Titan Bootstrap Fix
    # This finds the actual .pyd file in your .venv
    venv_site_packages = os.path.join(os.getcwd(), '.venv', 'Lib', 'site-packages')
    ml_path = os.path.join(venv_site_packages, 'ml_dtypes')
    
    if not os.path.exists(ml_path):
        print(f"🛑 ERROR: Could not find .venv at {ml_path}")
        return

    print(f"🛠️ Attempting manual C-extension load from: {ml_path}")
    
    pyd_found = False
    for file in os.listdir(ml_path):
        if file.endswith(".pyd"):
            pyd_found = True
            pyd_full_path = os.path.join(ml_path, file)
            try:
                # This is the line we added to main.py
                ctypes.PyDLL(pyd_full_path)
                print(f"✅ Successfully loaded: {file}")
            except Exception as e:
                print(f"❌ ctypes load failed: {e}")

    if not pyd_found:
        print("🛑 ERROR: No .pyd file found in ml_dtypes folder.")
        return

    # 3. Final Verification
    # After ctypes.PyDLL, the dtypes should be registered in NumPy
    try:
        # If the fix works, NumPy will now recognize 'float4_e2m1fn'
        test_dtype = np.dtype('float4_e2m1fn')
        print(f"🎉 VICTORY: NumPy successfully recognized the dtype: {test_dtype}")
        print("\n🚀 You are safe to run the PyInstaller build now.")
    except TypeError:
        print("❌ STILL BROKEN: NumPy does not recognize the dtype even after manual load.")

if __name__ == "__main__":
    test_ml_dtypes_fix()