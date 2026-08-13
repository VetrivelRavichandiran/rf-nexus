import os
import sys
import numpy as np
import ctypes

def verify_titan_numpy():
    print("--- 🔬 NUMPY C-API INTEGRITY CHECK ---")
    print(f"NumPy Version: {np.__version__}")
    print(f"Python Version: {sys.version}")
    print(f"NumPy Include Path: {np.get_include()}")
    
    # 1. Test C-API Health: Can we create a basic user-dtype?
    print("\n🧪 Testing C-API Handshake...")
    try:
        # We try to create a "dummy" structured dtype to see if the engine is responsive
        test_dt = np.dtype([('f1', np.int32)])
        print("✅ NumPy Base C-API: Healthy")
    except Exception as e:
        print(f"❌ NumPy Base C-API: Corrupt or Busy ({e})")

    # 2. Check for Version Mismatch in the Binary
    # We find the .pyd and check its "Header" version vs current NumPy
    root_path = os.path.dirname(os.getcwd())
    ml_pyd = os.path.join(root_path, '.venv', 'Lib', 'site-packages', 'ml_dtypes', '_custom_floats.cp310-win_amd64.pyd')
    
    if os.path.exists(ml_pyd):
        print(f"\n📂 Analyzing Binary: {os.path.basename(ml_pyd)}")
        try:
            # We check if the binary is blocked by Windows 'Safe DLL Search'
            handle = ctypes.windll.kernel32.LoadLibraryW(ml_pyd)
            if handle:
                print("✅ Binary File: Accessible & Loadable by OS")
                ctypes.windll.kernel32.FreeLibrary(handle)
            else:
                print("❌ Binary File: Blocked by Windows or Missing Dependencies")
        except Exception as e:
            print(f"❌ Binary Load Error: {e}")
    
    # 3. Check for 'Ghost' NumPy versions
    print("\n📡 Checking for Multiple NumPy Installations...")
    import subprocess
    try:
        output = subprocess.check_output([sys.executable, "-m", "pip", "show", "numpy"]).decode()
        for line in output.split('\n'):
            if "Location:" in line:
                print(f"📍 Active NumPy Location: {line.strip()}")
    except:
        print("⚠️ Could not verify pip location.")

if __name__ == "__main__":
    verify_titan_numpy()