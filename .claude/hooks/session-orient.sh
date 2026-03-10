#!/bin/bash
# Session orientation hook - runs at session start
# Loads orientation state for the agent

echo "=== Session Orientation ==="
echo "Date: $(date)"
echo ""

# Check for self/ space orientation
if [ -f "self/goals.md" ]; then
    echo "--- Current Goals (self/goals.md) ---"
    head -50 self/goals.md
    echo ""
fi

# Check reminders
if [ -f "ops/reminders.md" ]; then
    echo "--- Reminders ---"
    grep "^- \[ \]" ops/reminders.md | head -10
    echo ""
fi

# Show recent notes
echo "--- Recent Notes ---"
ls -lt notas-tecnicas/*.md 2>/dev/null | head -5 | awk '{print $9}' | while read f; do
    echo "  - $f"
done

echo ""
echo "=== End Orientation ==="
