#!/usr/bin/env bash
set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
GRAY='\033[0;37m'
YELLOW='\033[1;33m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PATH="$SCRIPT_DIR/lefarma.backend/src/Lefarma.API"
FRONTEND_PATH="$SCRIPT_DIR/lefarma.frontend"

BACKEND_PORT=5134
FRONTEND_PORT=5173

BACKEND_PID=""
FRONTEND_PID=""

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  Lefarma Project Initialization${NC}"
echo -e "${GREEN}  HOT RELOAD ENABLED${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

kill_process_by_port() {
    local port=$1
    local pid
    pid=$(lsof -ti :"$port" 2>/dev/null || true)
    if [ -n "$pid" ]; then
        echo -e "  ${GRAY}Stopping existing process on port $port (PID: $pid)...${NC}"
        kill -9 $pid 2>/dev/null || true
        sleep 2
    fi
}

cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down services...${NC}"
    [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null || true
    [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null || true
    wait 2>/dev/null
    echo -e "${GREEN}All services stopped.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

echo -e "${YELLOW}Checking for existing processes...${NC}"
kill_process_by_port "$BACKEND_PORT"
kill_process_by_port "$FRONTEND_PORT"
echo ""

echo -e "${YELLOW}[1/2] Starting Backend (.NET API) with Hot Reload...${NC}"
cd "$BACKEND_PATH"
dotnet watch run --launch-profile http &
BACKEND_PID=$!

sleep 3

echo -e "${YELLOW}[2/2] Starting Frontend (React + Vite) with Hot Reload...${NC}"
cd "$FRONTEND_PATH"
npm run dev &
FRONTEND_PID=$!

cd "$SCRIPT_DIR"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Services Started!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "  Backend API:  ${CYAN}http://localhost:$BACKEND_PORT${NC}"
echo -e "  Frontend:     ${CYAN}http://localhost:$FRONTEND_PORT${NC}"
echo -e "  Swagger:      ${CYAN}http://localhost:$BACKEND_PORT${NC}"
echo ""
echo -e "  ${GREEN}HOT RELOAD ACTIVE:${NC}"
echo -e "  ${GRAY}- Backend:  .NET Hot Reload (change .cs files)${NC}"
echo -e "  ${GRAY}- Frontend: Vite HMR (change .tsx/.css files)${NC}"
echo ""
echo -e "  Press ${YELLOW}Ctrl+C${NC} to stop all services"
echo ""

wait
