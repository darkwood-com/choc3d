#!/bin/sh

python build.py --include choc3d --output ../build/choc3d.js
python build.py --include choc3d --minify --output ../build/choc3d.min.js
