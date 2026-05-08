#!/bin/bash
# 1. Run the build compiler to inject the latest header/footer into all pages
python3 /root/Madereal/build_master.py
# 2. Add, commit, and push in one go
git add .
git commit -m "Auto-update: Propagate menu/header changes across all pages"
git push origin main
