from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, Any
from app.services.websocket_manager import ws_manager
from app.services.vault_service import vault_service
import asyncio
import random

router = APIRouter()

@router.websocket("/logs/{channel_id}")
async def websocket_log_endpoint(websocket: WebSocket, channel_id: str):
    """
    WebSocket endpoint for real-time log streaming for builds or containers.
    Logs are automatically sanitized through the Vault secret masking filter.
    """
    await ws_manager.connect_channel(websocket, channel_id)
    try:
        # Send initial connection confirmation
        welcome_msg = {
            "type": "system",
            "message": f"Connected to live log stream for {channel_id}",
            "timestamp": "now"
        }
        await websocket.send_json(welcome_msg)
        
        while True:
            # Keep connection open and accept incoming client messages/pings
            data = await websocket.receive_text()
            # If client sends a ping or log line, echo or handle
            sanitized = vault_service.mask_secrets(data)
            await websocket.send_json({"type": "client_echo", "data": sanitized})
    except WebSocketDisconnect:
        ws_manager.disconnect_channel(websocket, channel_id)
    except Exception:
        ws_manager.disconnect_channel(websocket, channel_id)

@router.websocket("/metrics")
async def websocket_metrics_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint broadcasting live system metrics (CPU, Memory, Network).
    """
    await ws_manager.connect_broadcast(websocket)
    try:
        while True:
            # Periodically push simulated live metrics
            metrics_payload = {
                "type": "metrics_tick",
                "cpu_percent": round(random.uniform(20.0, 75.0), 1),
                "memory_percent": round(random.uniform(40.0, 80.0), 1),
                "active_connections": random.randint(120, 250),
            }
            await websocket.send_json(metrics_payload)
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        ws_manager.disconnect_broadcast(websocket)
    except Exception:
        ws_manager.disconnect_broadcast(websocket)

@router.post("/broadcast/{channel_id}")
async def broadcast_log_message(channel_id: str, message: Dict[str, Any]):
    """
    REST endpoint to broadcast a log line or event to connected WebSocket clients.
    """
    if "text" in message:
        message["text"] = vault_service.mask_secrets(message["text"])
    await ws_manager.broadcast_to_channel(channel_id, message)
    return {"status": "broadcast_sent", "channel_id": channel_id}
