import socketio

class SocketIOResponse:
    """
    A class that handles writing messages for the bot using Socket.IO.
    """

    def __init__(
        self,
        sio: socketio.AsyncServer,
        sid: str,
        connection_manager=None,
    ):
        self.sio = sio
        self.sid = sid
        self.connection_manager = connection_manager
