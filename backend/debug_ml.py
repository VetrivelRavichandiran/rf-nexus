import os
import sys
import importlib
import numpy as np

def deep_diagnostic():
    print("--- 🔍 TITAN DEEP DIAGNOSTIC ---")
    
    # 1. Check Version Compatibility
    print(f"Python Version: {sys.version}")
    print(f"NumPy Version: {np.__version__}")
    
    # 2. Trace the Import path
    try:
        import ml_dtypes
        print(f"✅ ml_dtypes found at: {ml_dtypes.__file__}")
    except ImportError as e:
        print(f"❌ ml_dtypes Import Failed: {e}")

    # 3. Inspect the Binary (The .pyd)
    venv_lib = os.path.join(os.getcwd(), '.venv', 'Lib', 'site-packages', 'ml_dtypes')
    pyd_files = [f for f in os.listdir(venv_lib) if f.endswith('.pyd')]
    print(f"📂 Found Binaries: {pyd_files}")

    # 4. THE CRITICAL TEST: Manual Registration Trigger
    # We will try to force the internal C-API call that ml_dtypes uses
    print("\n🛠️ Attempting Forced Handshake...")
    try:
        # This is the internal module that usually handles registration
        from ml_dtypes import _custom_floats
        print("✅ Internal _custom_floats reachable.")
        
        # Check if the float types are in the module's dictionary
        available_types = [t for t in dir(_custom_floats) if 'float' in t or 'int' in t]
        print(f"📋 Types defined in binary: {available_types}")
        
        # Check if NumPy actually accepted them
        for t_name in ['float4_e2m1fn', 'int4', 'uint4']:
            try:
                test_dt = np.dtype(t_name)
                print(f"🌟 NumPy status for {t_name}: REGISTERED")
            except TypeError:
                print(f"⚠️ NumPy status for {t_name}: NOT REGISTERED")
                
    except Exception as e:
        print(f"💥 Handshake Error: {e}")

if __name__ == "__main__":
    deep_diagnostic()