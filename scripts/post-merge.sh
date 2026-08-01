#!/bin/bash
set -e

# Bağımlılıkları kur (yeni paket eklendiyse)
npm install --legacy-peer-deps

echo "[post-merge] Kurulum tamamlandı."
