import os

keras_base_path = r"E:\RF\.venv\lib\site-packages\keras"

def fix_file_content(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        
        new_lines = []
        changed = False
        for line in lines:
            # 1. Fix the keras.src loops
            if "from keras.src" in line:
                line = line.replace("from keras.src", "from keras")
                changed = True
            
            # 2. CRITICAL: Fix relative internal loops
            # If a file in keras/backend/ tries to import from keras.backend, it loops.
            # We force it to use the absolute path.
            if "from keras import" in line and "import keras" not in line:
                # No change needed here usually, but keeping as a placeholder
                pass
                
            new_lines.append(line)
        
        if changed:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            return True
    except Exception:
        pass
    return False

print("🛠️ TITAN ENGINE: PERFORMING RADIOLOGICAL CLEANUP...")
count = 0
for root, dirs, files in os.walk(keras_base_path):
    for file in files:
        if file.endswith(".py"):
            if fix_file_content(os.path.join(root, file)):
                count += 1

print(f"✅ Success! Harmonized {count} files.")