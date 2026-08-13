import os
import sys
import importlib

def deep_scan():
    print("--- 🔍 TITAN ENGINE: DEEP ENVIRONMENT SCAN ---")
    
    # 1. Check Keras Identity
    try:
        import keras
        print(f"📍 Keras Version: {keras.__version__}")
        print(f"📍 Keras Location: {keras.__file__}")
    except Exception as e:
        print(f"❌ Keras Import Failed: {e}")
        return

    # 2. Check for "Ghost" Keras 3.0 Folders
    keras_path = os.path.dirname(keras.__file__)
    src_path = os.path.join(keras_path, "src")
    print(f"\n📂 Checking for Keras 3 ghost folders...")
    if os.path.exists(src_path):
        print(f"⚠️ WARNING: 'src' folder exists inside Keras. Keras 2.15 should NOT have this.")
        print(f"   Contents of {src_path}: {os.listdir(src_path)[:5]}...")
    else:
        print("✅ No Keras 3 'src' ghost folder found.")

    # 3. Trace 'serialization' attribute
    print(f"\n🧪 Testing 'keras.layers.serialization' logic...")
    import keras.layers
    if hasattr(keras.layers, "serialization"):
        print(f"✅ Found 'serialization' in keras.layers.")
    else:
        print(f"❌ 'serialization' is MISSING from keras.layers.")
        # Let's find where it actually is
        search_targets = ["keras.saving.serialization_lib", "keras.utils.generic_utils", "keras.saving.legacy.saved_model.utils"]
        for target in search_targets:
            try:
                mod = importlib.import_module(target)
                print(f"💡 Found alternative at: {target}")
            except ImportError:
                pass

    # 4. Binary/DType Check (NumPy conflict)
    print(f"\n🧪 Checking NumPy types...")
    import numpy as np
    problem_types = ['float8_e4m3fn', 'int4']
    for t in problem_types:
        if t in np.sctypeDict:
            print(f"✅ NumPy knows about: {t}")
        else:
            print(f"❌ NumPy MISSING type: {t}")

    print("\n" + "="*50)
    print("SCAN COMPLETE. Please copy-paste the output above.")
    print("="*50)

if __name__ == "__main__":
    deep_scan()