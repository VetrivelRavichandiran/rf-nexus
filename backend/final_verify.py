import os
import sys

def run_stress_test():
    print("🛡️  TITAN PRE-BUILD VALIDATION")
    print("-" * 30)

    # 1. Check Module Visibility
    print("🔍 1. Checking Module Paths...")
    modules = ['tensorflow', 'keras', 'optree', 'namex', 'ml_dtypes', 'h5py']
    missing = []
    for mod in modules:
        try:
            __import__(mod)
            print(f"✅ {mod}: Found")
        except ImportError:
            print(f"❌ {mod}: MISSING")
            missing.append(mod)
    
    if missing:
        print(f"\n🛑 STOP: Install missing modules: pip install {' '.join(missing)}")
        return

    # 2. Check Keras-TensorFlow Linkage
    print("\n🔍 2. Checking Keras Backend...")
    try:
        import keras
        import tensorflow as tf
        backend = keras.backend.backend()
        print(f"✅ Keras Backend: {backend}")
        if backend != "tensorflow":
            print("⚠️ Warning: Keras is not using TensorFlow!")
    except Exception as e:
        print(f"❌ Backend Error: {e}")
        return

    # 3. Check Native C++ Initialization (The DLL Test)
    print("\n🔍 3. Checking Native Runtime (DLLs)...")
    try:
        # This triggers the exact same logic that was failing in your EXE
        a = tf.constant([[1.0, 2.0], [3.0, 4.0]])
        b = tf.constant([[5.0, 6.0], [7.0, 8.0]])
        c = tf.matmul(a, b)
        print(f"✅ Native Math Success: Result {c.numpy()[0][0]}")
    except Exception as e:
        print(f"❌ DLL CRASH: {e}")
        return

    print("\n" + "="*30)
    print("🏁 RESULT: 100% HEALTHY. PROCEED TO BUILD.")
    print("="*30)

if __name__ == "__main__":
    run_stress_test()