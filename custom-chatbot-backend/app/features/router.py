from fastapi import APIRouter, FastAPI

# from app.socketio_server import get_socketio_server, ConnectionManager

import socketio

class SocketManager:
    def __init__(self):
        self.server = socketio.AsyncServer(
            cors_allowed_origins=["http://localhost:8000", "http://localhost:3000"],
            async_mode="asgi",
            logger=True,
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

def handle_connect(sid, environ):
    print(f"socket connected with sid {sid}")

def handle_message(sid, data):
    print(f"Message from {sid}: {data}")
    socket_manager.send(sid, f"Received your message: {data}")


socket_manager.on("message", handler=handle_message)
socket_manager.on("connect", handler=handle_connect)

router = APIRouter()

@router.get("/text")
async def get_chat():
    print("chat history")
    return {"message": "Chat History"}


@router.get("/getuser")
async def get_users():
    return {"message": "List of users"}

