from typing import Dict, List
from fastapi import WebSocket
import logging
import json

logger = logging.getLogger(__name__)

class ConnectionManager:
    """
    Manages active WebSocket connections for topic-based real-time log streaming and metric updates.
    """

    def __init__(self):
        # Map of channel_id -> list of active WebSockets
        self.active_channels: Dict[str, List[WebSocket]] = {}
        # Global broadcast connections (e.g. metrics)
        self.broadcast_connections: List[WebSocket] = []

    async def connect_channel(self, websocket: WebSocket, channel_id: str):
        await websocket.accept()
        if channel_id not in self.active_channels:
            self.active_channels[channel_id] = []
        self.active_channels[channel_id].append(websocket)
        logger.info(f"WebSocket client connected to channel: {channel_id}")

    def disconnect_channel(self, websocket: WebSocket, channel_id: str):
        if channel_id in self.active_channels:
            if websocket in self.active_channels[channel_id]:
                self.active_channels[channel_id].remove(websocket)
            if not self.active_channels[channel_id]:
                del self.active_channels[channel_id]
        logger.info(f"WebSocket client disconnected from channel: {channel_id}")

    async def broadcast_to_channel(self, channel_id: str, message: dict):
        if channel_id in self.active_channels:
            payload = json.dumps(message)
            for connection in self.active_channels[channel_id]:
                try:
                    await connection.send_text(payload)
                except Exception as e:
                    logger.warning(f"Error sending message to client on channel {channel_id}: {e}")

    async def connect_broadcast(self, websocket: WebSocket):
        await websocket.accept()
        self.broadcast_connections.append(websocket)
        logger.info("WebSocket client connected to global broadcast.")

    def disconnect_broadcast(self, websocket: WebSocket):
        if websocket in self.broadcast_connections:
            self.broadcast_connections.remove(websocket)
        logger.info("WebSocket client disconnected from global broadcast.")

    async def broadcast_global(self, message: dict):
        payload = json.dumps(message)
        for connection in self.broadcast_connections:
            try:
                await connection.send_text(payload)
            except Exception as e:
                logger.warning(f"Error sending global broadcast: {e}")

ws_manager = ConnectionManager()
