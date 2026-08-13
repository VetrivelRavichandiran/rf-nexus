# -*- mode: python ; coding: utf-8 -*-
import os
import sys
from PyInstaller.utils.hooks import collect_all

block_cipher = None
base_path = r'E:/RF' 

# 1. Identify the site-packages path
# This ensures we grab the physical files from your virtual environment
site_packages = os.path.join(base_path, '.venv', 'Lib', 'site-packages')

# 2. Collect TensorFlow and Core Metadata
# This gathers entry points and metadata for TF-dependent libraries
tf_info = collect_all('tensorflow')

manual_datas = [
    # Project specific folders
    (os.path.join(base_path, 'backend/dist'), 'dist'),
    (os.path.join(base_path, 'backend/trained_models'), 'trained_models'),
    (os.path.join(base_path, 'backend/datasets'), 'datasets'),
    (os.path.join(base_path, 'backend/core'), 'core'),
    (os.path.join(base_path, 'backend/api'), 'api'),
    (os.path.join(base_path, 'backend/ml_pipeline'), 'ml_pipeline'),
    
    # THE SLEDGEHAMMER COLLECTION
    # Physically copying these folders fixes 'No module named' errors for internal guts
    (os.path.join(site_packages, 'tensorflow'), 'tensorflow'),
    (os.path.join(site_packages, 'google'), 'google'), 
] + tf_info[0]

a = Analysis(
    [os.path.join(base_path, 'backend/main.py')],
    pathex=[os.path.join(base_path, 'backend')],
    binaries=tf_info[1],
    datas=manual_datas,
    hiddenimports=[
        # TensorFlow Internal Guts
        'tensorflow',
        'tensorflow.python',
        'tensorflow.python.keras',
        'tensorflow.python.keras.models',
        'tensorflow.python.keras.utils',
        'tensorflow.python.keras.utils.generic_utils',
        'tensorflow.core.framework',
        
        # Core Infrastructure & Metadata
        'absl.flags', 
        'absl.logging', 
        'absl.app',
        'google.protobuf',
        'google.protobuf.internal',
        'google.protobuf.internal.enum_type_wrapper',
        'astunparse',
        'gast',
        'opt_einsum',
        'termcolor',
        'wrapt',          # Fixed the 'No module named wrapt' error
        'flatbuffers',
        
        # Web & API
        'uvicorn.logging', 
        'uvicorn.protocols.http.h11_impl', 
        'h11',
        
        # Data Science & ML Utilities
        'pandas', 
        'joblib',
        'h5py',
        'sklearn.utils._cython_blas', 
        'sklearn.neighbors.typedefs',
        
        # Reporting & Visualization (Antenna Plots)
        'fpdf',
        'matplotlib',
        'matplotlib.pyplot',
        'seaborn'
    ] + tf_info[2],
    excludes=['torch', 'tensorboard', 'nvidia', 'IPython'],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='RF-NEXUS-Titan',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='RF-NEXUS-Titan',
)