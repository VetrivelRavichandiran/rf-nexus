# -*- mode: python ; coding: utf-8 -*-
import os
import sys

block_cipher = None
base_path = r'E:/RF' 
site_packages = r'E:\RF\.venv\lib\site-packages'

libraries_to_bundle = [
    'tensorflow', 'keras', 'optree', 'namex', 'ml_dtypes', 
    'h5py', 'astunparse', 'numpy', 'absl', 'rich', 'opt_einsum',
    'wrapt', 'google', 'termcolor', 'typing_extensions'
]

manual_datas = [
    (os.path.join(base_path, 'backend/dist'), 'dist'),
    (os.path.join(base_path, 'backend/datasets'), 'datasets'),
    (os.path.join(base_path, 'backend/trained_models'), 'trained_models'),
]

for lib in libraries_to_bundle:
    lib_path = os.path.join(site_packages, lib)
    if os.path.exists(lib_path):
        manual_datas.append((lib_path, lib))

a = Analysis(
    [os.path.join(base_path, 'backend/main.py')],
    pathex=[os.path.join(base_path, 'backend')],
    binaries=[],
    datas=manual_datas,
    hiddenimports=['uvicorn.logging', 'uvicorn.protocols.http.h11_impl', 'h11', 'pandas', 'joblib'],
    # EXCLUDE ml_dtypes to let our Ghost Registration in main.py take priority
    excludes=['torch', 'tensorboard', 'nvidia', 'IPython', 'ml_dtypes'],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)
exe = EXE(pyz, a.scripts, [], exclude_binaries=True, name='RF-NEXUS-Titan', debug=False, console=True)
coll = COLLECT(exe, a.binaries, a.zipfiles, a.datas, name='RF-NEXUS-Titan')