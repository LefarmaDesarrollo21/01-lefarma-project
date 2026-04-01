#!/usr/bin/env bash
set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
GRAY='\033[0;37m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_PATH="$SCRIPT_DIR/lefarma.backend/src/Lefarma.API"
FRONTEND_PATH="$SCRIPT_DIR/lefarma.frontend"

BACKEND_PORT=5174
FRONTEND_PORT=5173

PUBLIC_IP="$(hostname -I | awk '{print $1}')"

COMMAND=""
TARGET="all"

if [ $# -eq 0 ]; then
    COMMAND="start"
else
    case "$1" in
        restart)
            COMMAND="restart"
            if [ $# -eq 2 ]; then
                case "$2" in
                    backend|frontend)
                        TARGET="$2"
                        ;;
                    *)
                        echo -e "${RED}Unknown target: $2 (use 'backend' or 'frontend')${NC}"
                        exit 1
                        ;;
                esac
            fi
            ;;
        stop|--stop)
            COMMAND="stop"
            ;;
        start|--start)
            COMMAND="start"
            ;;
        *)
            echo -e "${RED}Unknown argument: $1${NC}"
            echo "Usage: $0 [restart [backend|frontend] | stop | start]"
            exit 1
            ;;
    esac
fi

kill_process_by_port() {
    local port=$1
    local pids
    pids=$(lsof -ti :"$port" 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo -e "  ${GRAY}Stopping process on port $port (PIDs: $pids)...${NC}"
        for pid in $pids; do
            kill -9 "$pid" 2>/dev/null || true
        done
        sleep 1
    fi
}

print_usage() {
    echo -e "  ${YELLOW}Usage:${NC}"
    echo -e "  ${GRAY}  ./init.sh                      Start both services${NC}"
    echo -e "  ${GRAY}  ./init.sh restart               Restart both services${NC}"
    echo -e "  ${GRAY}  ./init.sh restart backend        Restart backend only${NC}"
    echo -e "  ${GRAY}  ./init.sh restart frontend       Restart frontend only${NC}"
    echo -e "  ${GRAY}  ./init.sh stop                   Stop both services${NC}"
}

start_backend() {
    echo -e "${YELLOW}Starting Backend (.NET API) with Hot Reload...${NC}"
    cd "$BACKEND_PATH"
    nohup dotnet watch run --launch-profile http > /tmp/lefarma-backend.log 2>&1 &
    local pid=$!
    cd "$SCRIPT_DIR"
    echo -e "  ${GREEN}Backend started (PID: $pid) → http://$PUBLIC_IP:$BACKEND_PORT${NC}"
    echo "$pid" > /tmp/lefarma-backend.pid
}

start_frontend() {
    echo -e "${YELLOW}Starting Frontend (React + Vite) with Hot Reload...${NC}"
    cd "$FRONTEND_PATH"
    nohup ./node_modules/.bin/vite --host 0.0.0.0 --port "$FRONTEND_PORT" > /tmp/lefarma-frontend.log 2>&1 &
    local pid=$!
    cd "$SCRIPT_DIR"
    echo -e "  ${GREEN}Frontend started (PID: $pid) → http://$PUBLIC_IP:$FRONTEND_PORT${NC}"
    echo "$pid" > /tmp/lefarma-frontend.pid
}

stop_backend() {
    if [ -f /tmp/lefarma-backend.pid ]; then
        local pid
        pid=$(cat /tmp/lefarma-backend.pid)
        kill -9 "$pid" 2>/dev/null || true
        rm -f /tmp/lefarma-backend.pid
    fi
    kill_process_by_port "$BACKEND_PORT"
}

stop_frontend() {
    if [ -f /tmp/lefarma-frontend.pid ]; then
        local pid
        pid=$(cat /tmp/lefarma-frontend.pid)
        kill -9 "$pid" 2>/dev/null || true
        rm -f /tmp/lefarma-frontend.pid
    fi
    kill_process_by_port "$FRONTEND_PORT"
}

print_urls() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  Services Ready!${NC}"
    echo -e "${GREEN}========================================${NC}"
    if [ "$TARGET" = "all" ] || [ "$TARGET" = "backend" ]; then
        echo -e "  Backend API:  ${CYAN}http://$PUBLIC_IP:$BACKEND_PORT${NC}"
        echo -e "  Swagger:      ${CYAN}http://$PUBLIC_IP:$BACKEND_PORT${NC}"
    fi
    if [ "$TARGET" = "all" ] || [ "$TARGET" = "frontend" ]; then
        echo -e "  Frontend:     ${CYAN}http://$PUBLIC_IP:$FRONTEND_PORT${NC}"
    fi
    echo ""
    echo -e "  ${GREEN}HOT RELOAD ACTIVE${NC}"
    echo ""
    print_usage
    echo ""
}

case "$COMMAND" in
    stop)
        echo -e "${CYAN}========================================${NC}"
        echo -e "${RED}  Stopping Lefarma Services${NC}"
        echo -e "${CYAN}========================================${NC}"
        echo ""
        stop_backend
        stop_frontend
        echo -e "${GREEN}All services stopped.${NC}"
        ;;
    restart)
        echo -e "${CYAN}========================================${NC}"
        echo -e "${YELLOW}  Restarting Lefarma${NC}"
        if [ "$TARGET" = "all" ]; then
            echo -e "${YELLOW}  (backend + frontend)${NC}"
        else
            echo -e "${YELLOW}  ($TARGET only)${NC}"
        fi
        echo -e "${CYAN}========================================${NC}"
        echo ""

        if [ "$TARGET" = "all" ] || [ "$TARGET" = "backend" ]; then
            stop_backend
            start_backend
        fi

        if [ "$TARGET" = "all" ] || [ "$TARGET" = "frontend" ]; then
            stop_frontend
            start_frontend
        fi

        print_urls
        ;;
    start)
        echo -e "${CYAN}========================================${NC}"
        echo -e "${CYAN}  Lefarma Project Initialization${NC}"
        echo -e "${GREEN}  HOT RELOAD ENABLED${NC}"
        echo -e "${CYAN}========================================${NC}"
        echo ""

        echo -e "${YELLOW}Checking for existing processes...${NC}"
        stop_backend
        stop_frontend
        echo ""

        start_backend
        echo ""
        start_frontend

        print_urls
        ;;
esac
