import os
import sys
import numpy as np

def simulate_titan_exe_environment():
    print("--- 🔬 TITAN ENGINE: PRE-BUILD VALIDATION ---")

    # 1. Simulate Ghost Registration (The fix for your first error)
    print("\n🛠️ Step 1: Simulating Ghost Registration...")
    ghost_map = {
        'float4_e2m1fn': np.float32,
        'float8_e4m3fn': np.float32,
        'bfloat16': np.float32
    }
    for type_name, alias_obj in ghost_map.items():
        np.sctypeDict[type_name] = alias_obj
    
    try:
        # Verify NumPy is now "tricked" correctly
        _ = np.dtype("float4_e2m1fn")
        print("✅ SUCCESS: NumPy now recognizes Ghost Types.")
    except TypeError:
        print("❌ FAILED: NumPy still rejects Ghost Types.")
        return

    # 2. Simulate Path Injection (The fix for the 'tensorflow.compat' error)
    print("\n🛠️ Step 2: Testing TensorFlow internal pathing...")
    
    # Locate where your actual tensorflow is
    import tensorflow as tf
    tf_path = os.path.dirname(tf.__file__)
    print(f"📍 TensorFlow located at: {tf_path}")

    # This is what Keras tried to do when it crashed:
    print("🧪 Attempting critical import: 'tensorflow.compat.v2'...")
    try:
        import tensorflow.compat.v2 as tf_v2
        print("✅ SUCCESS: 'tensorflow.compat.v2' is reachable.")
    except ImportError as e:
        print(f"❌ FAILED: Could not find compat module: {e}")
        print("\n💡 ACTION: If this fails, we need to force-reinstall TensorFlow.")
        return

    # 3. Simulate Keras Boot Sequence
    print("\n🛠️ Step 3: Simulating Keras Deep-Boot...")
    try:
        from keras.src.applications import convnext
        print("✅ SUCCESS: Keras ConvNeXt initialized without error.")
    except Exception as e:
        print(f"❌ FAILED: Keras boot failed: {e}")
        return

    print("\n" + "="*50)
    print("🎉 ALL SYSTEMS GREEN: Ready for PyInstaller Build!")
    print("="*50)

if __name__ == "__main__":
    simulate_titan_exe_environment()