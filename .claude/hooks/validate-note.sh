#!/bin/bash
# Post-write validation hook
# Validates that new/modified notes meet schema requirements

# This hook runs after Write tool use
# It checks basic schema compliance

echo "=== Validating Notes ==="

# Find recently modified .md files in notas-tecnicas/
for file in $(find notas-tecnicas -name "*.md" -mmin -5 2>/dev/null); do
    echo "Checking: $file"

    # Check for required YAML frontmatter
    if ! head -1 "$file" | grep -q "^---$"; then
        echo "  WARNING: Missing YAML frontmatter"
    fi

    # Check for required fields
    if ! grep -q "^descripcion:" "$file"; then
        echo "  WARNING: Missing 'descripcion' field"
    fi

    if ! grep -q "^estado:" "$file"; then
        echo "  WARNING: Missing 'estado' field"
    fi

    if ! grep -q "^modulo:" "$file"; then
        echo "  WARNING: Missing 'modulo' field"
    fi

done

echo "=== Validation Complete ==="
