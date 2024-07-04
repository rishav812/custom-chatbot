import datetime
from fastapi import APIRouter, FastAPI

# from app.socketio_server import get_socketio_server, ConnectionManager

import socketio


class SocketManager:
    def __init__(self):
        self.server = socketio.AsyncServer(
            cors_allowed_origins=["http://localhost:8000", "http://localhost:3000"],
            async_mode="asgi",
            engineio_logger=True,
        )
        self.app = socketio.ASGIApp(self.server)

    @property
    def on(self):
        return self.server.on

    @property
    def send(self):
        return self.server.send

    def mount_to(self, path: str, app):
        app.mount(path, self.app)


# Initialize the FastAPI app and SocketManager

socket_manager = SocketManager()

active_client_sid = None


def handle_disconnect(sid, environ):
    global active_client_sid
    if sid == active_client_sid:
        print(f"Client disconnected: {sid}")
        active_client_sid = None


def handle_connect(sid, environ):
    global active_client_sid
    if active_client_sid is None:
        active_client_sid = sid
        print(f"Client connected: {sid}")
    else:
        print(f"Rejecting connection attempt from: {sid}")
        socket_manager.on("disconnect", handler=handle_disconnect)
    # while True:
    #     # data = await websocket.receive_text()
    #     socket_manager.on("message", handler=handle_message)


def handle_message(sid, data):
    print(f"Message from {sid}: {data}")
    socket_manager.send(sid, f"Received your message: {data}")


# socket_manager.on("message", handler=handle_message)
socket_manager.on("connect", handler=handle_connect)

router = APIRouter()


@router.get("/text")
async def get_chat():
    print("chat history")
    return {"message": "Chat History"}


@router.get("/getuser")
async def get_users():
    return {"message": "List of users"}
