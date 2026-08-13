import sys
import os

print("--- 🔬 TITAN ENGINE: MULTI-PATH STABILIZER ---")

try:
    # 1. THE DIRECT BRIDGE
    print("🧪 Injecting Absolute Bridges...")
    import tensorflow as tf
    import tensorflow.python.keras as tf_keras_internal
    
    sys.modules['keras'] = tf_keras_internal
    sys.modules['keras.src'] = tf_keras_internal
    sys.modules['tensorflow.compat'] = tf
    sys.modules['tensorflow.compat.v1'] = tf
    sys.modules['tensorflow.compat.v2'] = tf
    
    print("✅ Absolute Bridge Active.")

    # 2. THE MULTI-PATH SERIALIZATION PATCH
    print("🧪 Testing Serialization Fallbacks...")
    import tensorflow.python.keras.layers as layers
    patch_success = False
    
    # Path A: The 2.15 Generic Path
    try:
        import tensorflow.python.keras.utils.generic_utils as g_utils
        layers.serialization = g_utils
        print("✅ Path A (Generic Utils) Linked.")
        patch_success = True
    except ImportError:
        # Path B: The Deep Saving Path
        try:
            import tensorflow.python.keras.saving.serialization as k_ser
            layers.serialization = k_ser
            print("✅ Path B (Deep Saving) Linked.")
            patch_success = True
        except ImportError:
            # Path C: The Legacy Path
            from tensorflow.python.keras.utils import serialization
            layers.serialization = serialization
            print("✅ Path C (Legacy Serialization) Linked.")
            patch_success = True

    if not patch_success:
        raise ImportError("Could not locate Keras serialization module in any known path.")

    # 3. TEST MODEL MANAGER
    print("🧪 Verifying ML Pipeline...")
    sys.path.append(os.getcwd())
    from ml_pipeline.model_manager import model_manager
    print("✅ ModelManager initialized successfully.")
    
    print("\n" + "="*50)
    print("🚀 ALL SYSTEMS GO: Titan is stabilized.")
    print("="*50)

except Exception as e:
    print(f"\n❌ CRITICAL FAILURE: {e}")
    import traceback
    traceback.print_exc()

print("\n--- 🔬 DIAGNOSTIC END ---")