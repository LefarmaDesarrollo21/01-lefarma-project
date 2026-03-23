#!/bin/bash

# Script para sembrar el catálogo de Áreas
# Uso: ./scripts/seed-areas.sh [API_URL]
# Ejemplo: ./scripts/seed-areas.sh http://192.168.1.100:5000/api

API_URL="${1:-${VITE_API_URL:-http://localhost:5000/api}}"

echo "📍 Usando API: $API_URL"

# Credenciales de autenticación
USERNAME="54"
PASSWORD="tt01tt"
DOMAIN="artricenter"

echo "🔐 Autenticando..."
echo "   URL: $API_URL/auth/login"
LOGIN_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\", \"domain\": \"$DOMAIN\"}")

HTTP_CODE=$(echo "$LOGIN_RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
RESPONSE_BODY=$(echo "$LOGIN_RESPONSE" | grep -v "HTTP_CODE:")

echo "   HTTP Status: $HTTP_CODE"
echo "   Response: $RESPONSE_BODY"

if [ "$HTTP_CODE" != "200" ]; then
  echo "❌ Error: El API respondió con código $HTTP_CODE"
  echo "   Verifica que el backend esté corriendo en: $API_URL"
  exit 1
fi

TOKEN=$(echo $RESPONSE_BODY | jq -r '.data.token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo "❌ Error: No se pudo obtener el token"
  exit 1
fi

echo "✅ Token obtenido"

# Array de áreas
declare -a AREAS=(
  "Recursos Humanos|Solicitar a RH"
  "Contabilidad|Por definir"
  "Tesoreria|Por definir"
  "Compras|Por definir"
  "Almacen|Por definir"
  "Produccion|Por definir"
  "Ventas|Por definir"
  "Marketing|Por definir"
  "Tecnologia|Por definir"
  "Calidad|Por definir"
)

echo ""
echo "📝 Insertando áreas..."

for AREA_DATA in "${AREAS[@]}"; do
  IFS='|' read -r NOMBRE RESPONSABLE <<< "$AREA_DATA"

  echo "Creando: $NOMBRE - $RESPONSABLE"

  RESPONSE=$(curl -s -X POST "$API_URL/catalogos/areas" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"nombre\": \"$NOMBRE\",
      \"descripcion\": \"$RESPONSABLE\",
      \"clave\": \"\",
      \"activo\": true
    }")

  SUCCESS=$(echo $RESPONSE | jq -r '.success // false')

  if [ "$SUCCESS" = "true" ]; then
    echo "  ✅ Creado correctamente"
  else
    ERROR=$(echo $RESPONSE | jq -r '.message // .errors // "Error desconocido"')
    echo "  ❌ Error: $ERROR"
  fi

  sleep 0.5
done

echo ""
echo "✨ Proceso completado"
