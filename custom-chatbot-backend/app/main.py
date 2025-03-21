import asyncio
from typing import List
from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
import uvicorn
from app.features.bot.router import SocketManager, router as bot_router
from app.features.admin.router import router as admin_router
from app.models.milvus.collection.milvus_collection import create_collection
from pymilvus import connections as milvus_connections

from app.utils.milvus.operation.crud import initialize_milvus_collection
# from app.socketio_server import sio

milvus_alias = "default"


def connect_to_milvus():
    global milvus_alias
    milvus_connections.connect(
        alias=milvus_alias,
        host="localhost",
        port="19530",
    )


def disconnect_from_milvus():
    global milvus_alias
    milvus_connections.disconnect(alias=milvus_alias)


async def lifespan(app: FastAPI):
    global keyword_collection
    connect_to_milvus()
    # keyword_collection = create_collection()
    initialize_milvus_collection()
    yield  

    tasks_to_close: List[asyncio.Future] = [disconnect_from_milvus()]

    await asyncio.gather(*tasks_to_close, return_exceptions=True)

def get_application():
    _app = FastAPI(lifespan=lifespan)
    _app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    routes = APIRouter()
    routes.include_router(router=admin_router)
    routes.include_router(router=bot_router)
    _app.include_router(routes, prefix="/api/v1", tags=["api"])
    socket_app = SocketManager()
    socket_app.mount_to("/socket.io", _app)
    return _app


app = get_application()

# if __name__ == "__main__":
#     uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
