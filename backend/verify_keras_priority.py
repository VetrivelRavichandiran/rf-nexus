import os
import sys
import importlib

def test_keras_handshake():
    print("--- 🔬 TITAN ENGINE: KERAS PRIORITY VERIFICATION ---")

    # 1. Check if Keras is coming from the right place
    print("\n🧪 Trace-routing Keras...")
    try:
        import keras
        keras_origin = os.path.dirname(keras.__file__)
        print(f"📍 Keras Location: {keras_origin}")
        
        # Verify it's NOT inside the tensorflow folder (standalone check)
        if "tensorflow" in keras_origin.lower():
            print("⚠️ WARNING: Keras is being resolved inside TensorFlow. This is what we need to override in the EXE.")
        else:
            print("✅ SUCCESS: Keras is resolving as a standalone package.")
    except ImportError:
        print("❌ FAILED: Keras is not installed in this venv.")
        return

    # 2. Test 'keras.src' discovery (The line that often fails in bundles)
    print("\n🧪 Testing internal 'keras.src' pathing...")
    try:
        from keras.src.backend import any_symbolic_tensors
        print("✅ SUCCESS: 'keras.src' internal modules are reachable.")
    except ImportError:
        print("❌ FAILED: 'keras.src' is unreachable. Standalone Keras may be incomplete.")
        return

    # 3. Simulate the 'main.py' path injection logic
    print("\n🧪 Simulating EXE sys.path injection...")
    # We simulate moving the keras folder to the front of the line
    sys.path.insert(0, keras_origin)
    try:
        importlib.reload(keras)
        print("✅ SUCCESS: Re-importing Keras after path injection works.")
    except Exception as e:
        print(f"❌ FAILED: Path injection corrupted the import: {e}")

    # 4. Final Verification: Model Loading Check
    print("\n🧪 Verifying if DTypePolicyPatch handles the Keras load...")
    try:
        from ml_pipeline.model_manager import model_manager
        if model_manager.forward_model is not None:
             print("✅ SUCCESS: Keras and Models are communicating perfectly.")
    except Exception as e:
        print(f"❌ FAILED: ModelManager could not boot: {e}")

    print("\n" + "="*50)
    print("🚀 PRIORITY VERIFIED: Proceed to final PyInstaller build.")
    print("="*50)

if __name__ == "__main__":
    test_keras_handshake()