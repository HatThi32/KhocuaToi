#!/bin/sh
# Dựng lại toàn bộ bộ slide từ các tệp d_*.py rồi chép sang ../../bai/
# Dùng:  sh build_slides.sh        (tất cả)   |   sh build_slides.sh d_c4.py   (một bộ)
cd "$(dirname "$0")" || exit 1
for f in ${@:-d_*.py}; do python3 "$f" || exit 1; done
for f in ${@:-d_*.py}; do
  case "$f" in
    d_b12*) o=w2-b12;; d_b13*) o=w3-b13;; d_b14*) o=w3-b14;; d_b15*) o=w4-b15;; d_b16*) o=w5-b16;; d_b17*) o=w5-b17;; d_b18*) o=w6-b18;;
    d_*) o=$(basename "$f" .py | sed 's/^d_//');;
  esac
  [ -f "$o.html" ] && mv "$o.html" ../../bai/
done
