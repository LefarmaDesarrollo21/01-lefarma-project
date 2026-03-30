#!/usr/bin/env bash
set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PATH="$SCRIPT_DIR/lefarma.backend/src/Lefarma.API"
FRONTEND_PATH="$SCRIPT_DIR/lefarma.frontend"

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  Lefarma Project - Installation${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

echo -e "${YELLOW}Checking Node.js...${NC}"
if command -v node &>/dev/null; then
    echo -e "  Node.js: $(node --version) ${GREEN}✓${NC}"
else
    echo -e "${RED}  Node.js NOT FOUND. Install Node.js 18+ from https://nodejs.org${NC}"
    exit 1
fi

echo -e "${YELLOW}Checking npm...${NC}"
if command -v npm &>/dev/null; then
    echo -e "  npm: $(npm --version) ${GREEN}✓${NC}"
else
    echo -e "${RED}  npm NOT FOUND${NC}"
    exit 1
fi

echo -e "${YELLOW}Checking .NET SDK...${NC}"
if command -v dotnet &>/dev/null; then
    echo -e "  .NET SDK: $(dotnet --version) ${GREEN}✓${NC}"
else
    echo -e "${RED}  .NET SDK NOT FOUND. Install .NET 10 SDK from https://dotnet.microsoft.com/download${NC}"
    exit 1
fi

echo ""
echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  Installing Dependencies${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

echo -e "${YELLOW}[1/2] Installing Frontend dependencies...${NC}"
cd "$FRONTEND_PATH"
if ! npm install; then
    echo -e "${RED}  Frontend installation failed!${NC}"
    exit 1
fi
echo -e "  Frontend dependencies installed ${GREEN}✓${NC}"

echo -e "${YELLOW}[2/2] Restoring Backend dependencies...${NC}"
cd "$BACKEND_PATH"
if ! dotnet restore; then
    echo -e "${RED}  Backend restore failed!${NC}"
    exit 1
fi
echo -e "  Backend dependencies restored ${GREEN}✓${NC}"

cd "$SCRIPT_DIR"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Installation Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Run the following to start the project:"
echo -e "  ${CYAN}./init.sh${NC}"
echo ""
