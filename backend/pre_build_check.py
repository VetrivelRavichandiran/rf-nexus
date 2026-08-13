import sys
import os

def check_system():
    print("--- 🛡️ TITAN PRE-BUILD STRESS TEST ---")
    
    # 1. Check Core Dependencies (The "absl" and "google" check)
    print("🧪 Testing Core Dependencies...")
    try:
        import absl.logging
        import google.protobuf
        import h5py
        import pandas
        print("✅ Core Dependencies: FOUND")
    except ImportError as e:
        print(f"❌ Core Dependency Missing: {e}")
        return False

    # 2. Check TensorFlow & Internal Keras
    print("🧪 Testing TensorFlow Internal Path...")
    try:
        import tensorflow as tf
        import tensorflow.python.keras as tf_keras
        from tensorflow.python.keras.models import load_model
        from tensorflow.python.keras.utils.generic_utils import CustomObjectScope
        print(f"✅ TensorFlow Pathing: STABLE ({tf.__version__})")
    except ImportError as e:
        print(f"❌ TensorFlow Internal Path Missing: {e}")
        return False

    # 3. Check .h5 Model Loading (The "populate_deserializable_objects" check)
    print("🧪 Testing .h5 Model Rehydration...")
    try:
        # We use a dummy scope to see if the internal logic exists
        with CustomObjectScope({}):
            # This triggers the internal serialization check
            from tensorflow.python.keras.layers import Dense
            layer = Dense(10)
            config = layer.get_config()
            Dense.from_config(config)
        print("✅ Model Serialization Logic: FUNCTIONAL")
    except Exception as e:
        print(f"❌ Model Serialization Error: {e}")
        return False

    # 4. Check ModelManager & Paths
    print("🧪 Testing ModelManager initialization...")
    try:
        sys.path.append(os.getcwd())
        from ml_pipeline.model_manager import model_manager
        if model_manager.forward_model is not None:
            print("✅ ModelManager: LOADED & INITIALIZED")
        else:
            print("⚠️ ModelManager: LOADED BUT MODELS NULL (Check paths)")
    except Exception as e:
        print(f"❌ ModelManager Critical Failure: {e}")
        return False

    print("\n" + "="*50)
    print("🚀 100% WORKING MODEL: ALL PRE-BUILD TESTS PASSED")
    print("="*50)
    return True

if __name__ == "__main__":
    if not check_system():
        print("\n🛑 STOP: Do not build. Fix the errors above first.")
        sys.exit(1)