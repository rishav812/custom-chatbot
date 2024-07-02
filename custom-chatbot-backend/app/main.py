from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
from app.features.router import SocketManager, router

# from app.socketio_server import sio


def get_application():
    _app = FastAPI()
    _app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000/"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    _app.include_router(router, prefix="/api", tags=["api"])
    socket_app=SocketManager()
    socket_app.mount_to("/socket.io", _app)
    return _app

app=get_application()


# from fastapi import FastAPI
# from app.routes import chatbot

# app = FastAPI()
# sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode="asgi")
# socket_app = socketio.ASGIApp(sio)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:8000/"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
# app.mount("/", socket_app)

# app.include_router(chatbot.router, prefix="/api", tags=["api"])
# # app.include_router(item.router, prefix="/items", tags=["items"])


# # @app.get("/")
# # async def read_root():
# #     return {"message": "Welcome to the API"}

# Socket_io.py file
# import socketio
# from fastapi import FastAPI

# # Fast API application
# app = FastAPI()
# # Socket io (sio) create a Socket.IO server
# sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode="asgi")
# # wrap with ASGI application
# socket_app = socketio.ASGIApp(sio,app)

# @app.get("/get")
# def read_root():
#     return {"Hello": "World"}


# app.mount("/", socket_app)


# @sio.on("connect")
# async def connect(sid, env):
#     print("New Client Connected to This id :" + " " + str(sid))


# @sio.on("disconnect")
# async def disconnect(sid):
#     print("Client Disconnected: " + " " + str(sid))
