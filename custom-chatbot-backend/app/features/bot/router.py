import json
import socketio
from fastapi import FastAPI, APIRouter
from datetime import datetime

from app.features.bot.schemas import MessageData

# from app.main import get_application

app = FastAPI()
router = APIRouter()
# _app = get_application()


class SocketManager:
    def __init__(self):
        self.server = socketio.AsyncServer(
            cors_allowed_origins=["http://localhost:8000", "http://localhost:3000"],
            async_mode="asgi",
            engineio_logger=True,
        )
        self.app = socketio.ASGIApp(self.server)
        self.active_client_sid = None

        self.register_handlers()

    def register_handlers(self):
        @self.server.event
        async def connect(sid, environ):
            if self.active_client_sid is None:
                self.active_client_sid = sid
                print(f"Client connected: {sid}")
            # else:
            #     print(f"Rejecting connection attempt from: {sid}")
            #     await self.server.disconnect(sid)

        @self.server.event
        async def disconnect(sid):
            if sid == self.active_client_sid:
                print(f"Client disconnected: {sid}")
                await self.server.disconnect(sid)
                self.active_client_sid = None

        @self.server.event
        async def message(sid, data):
            # try:
                now = datetime.utcnow()
                current_time = now.strftime("%H:%M")
                isError = False
                print("handle-MESSAGES====================...")
                print(f"Message from {sid}: {data}")
                mt = data.get("mt", "")
                print("mt====",mt)
                if mt == "message_upload":
                    await handle_message_upload(data, sid, current_time, self.server)
                # await self.server.send(sid, f"Received your message: {data}")
        async def handle_message_upload(data, sid, current_time,server ):
            message = MessageData(
                time=current_time,
                chatId=sid, 
                message=data.get("message"),
                isBot=data.get("isBot"),
                mt="message_upload_confirm",
            )
            print("message====",message)
            await server.emit('new_message', json.dumps(message.dict()), room=sid)
            
                             

    def mount_to(self, path: str, app):
        app.mount(path, self.app)

        


socket_manager = SocketManager()
# socket_manager.mount_to("/socket.io", app)
#  socket_app.mount_to("/socket.io", _app)


@router.get("/text")
async def get_chat():
    print("chat history")
    return {"message": "Chat History"}


@router.get("/getuser")
async def get_users():
    return {"message": "List of users"}


app.include_router(router)
