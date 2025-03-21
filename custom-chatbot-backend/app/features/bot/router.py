import json
import socketio
from fastapi import FastAPI, APIRouter
from datetime import datetime

from app.features.bot.message import BotMessage
from app.features.bot.schemas import MessageData, MessageUploadData
from app.features.bot.socket_response import SocketIOResponse

# from app.main import get_application

app = FastAPI()
router = APIRouter()
# _app = get_application()


class SocketManager:
    def __init__(self):
        self.server = socketio.AsyncServer(
            cors_allowed_origins=[],
            async_mode="asgi",
            # engineio_logger=True,
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
            else:
                print(f"Rejecting connection attempt from: {sid}")
                await self.server.disconnect(sid)

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
            print("mt====", mt)
            if mt == "message_upload":
                await handle_message_upload(data, sid, current_time, self.server)
            # await self.server.send(sid, f"Received your message: {data}")

        async def handle_message_upload(data, sid, current_time, server):
            upload_data = MessageUploadData(**data)
            message = MessageData(
                time=current_time,
                sid=sid,
                message=upload_data.message,
                isBot=upload_data.isBot,
                mt="message_upload_confirm",
            )
            print("message====>", (message.dict()))

            await server.emit("new_message", json.dumps(message.dict()), room=sid)

            socket_response = SocketIOResponse(
                sio=server,
                sid=sid,
            )

            bot_message = BotMessage(
                socket_response=socket_response,
                sid=sid,
                time_zone=upload_data.timezone,
            )
            no_answer_found = await bot_message.send_bot_message(upload_data.message)
            print("no_answer_found=======>", no_answer_found)
            if no_answer_found:
                default_answer = (
                "Great question, we will train AI Rishav to answer this next time."
            )
                message = MessageData(
                    time=current_time,
                    sid=sid,
                    message=default_answer,
                    isBot=True,
                    # token=token,
                    mt="message_upload_confirm",
                )
                await server.emit("new_message", json.dumps(message.dict()), room=sid)

    def mount_to(self, path: str, app):
        app.mount(path, self.app)


socket_manager = SocketManager()


@router.get("/text")
async def get_chat():
    print("chat history")
    return {"message": "Chat History"}


@router.get("/getuser")
async def get_users():
    return {"message": "List of users"}


app.include_router(router)
