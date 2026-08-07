#!/bin/bash

TARGET_W=1131
TARGET_H=363
FILES=("Hoka.png" "4d.jpg" "Rele.jpg" "StrengthPilates.jpg" "maurten.png" "stretchlab.png")

for file in "${FILES[@]}"; do
    # Get original dimensions
    ORIG=$(sips -g pixelWidth -g pixelHeight "$file" 2>/dev/null | tail -2)
    ORIG_W=$(echo "$ORIG" | head -1 | grep -oE '[0-9]+$')
    ORIG_H=$(echo "$ORIG" | tail -1 | grep -oE '[0-9]+$')
    
    # Calculate aspect ratios
    ORIG_RATIO=$(echo "scale=4; $ORIG_W / $ORIG_H" | bc)
    TARGET_RATIO=$(echo "scale=4; $TARGET_W / $TARGET_H" | bc)
    
    # Determine new dimensions
    if (( $(echo "$ORIG_RATIO > $TARGET_RATIO" | bc -l) )); then
        NEW_W=$TARGET_W
        NEW_H=$(echo "$TARGET_W / $ORIG_RATIO" | bc)
    else
        NEW_H=$TARGET_H
        NEW_W=$(echo "$TARGET_H * $ORIG_RATIO" | bc)
    fi
    
    NEW_H=${NEW_H%.*}
    NEW_W=${NEW_W%.*}
    
    echo "Resizing $file: ${ORIG_W}x${ORIG_H} -> ${NEW_W}x${NEW_H} (fit in ${TARGET_W}x${TARGET_H})"
    sips -z "$NEW_H" "$NEW_W" "$file"
done
