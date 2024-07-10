from datetime import datetime
import re
from uuid import uuid4
from fastapi import logger
import socketio
from typing import Optional
from collections.abc import AsyncGenerator


class SocketIOResponse:
    """
    A class that handles writing messages for the bot using Socket.IO.
    """

    def __init__(
        self,
        sio: socketio.AsyncServer,
        sid: str,
    ):
        self.sio = sio
        self.sid = sid

    async def async_word_generator(self, text: str) -> AsyncGenerator[str, None]:
        """Async generator yielding words from the given text."""
        words = re.split(r"(\s+)", text)
        for word in words:
            yield word

    async def create_bot_response(
        self,
        text: str,
        time_zone: Optional[str] = None,
        user_question: Optional[str] = None,
        *,
        msg_type: Optional[str] = "normal_msg",
    ) -> Optional[str]:
        """Creates bot message and sends it. Returns full text."""
        now = datetime.utcnow()
        current_time = now.strftime("%H:%M")
        final_text = ""
        print("text===>", text)
        # text = self.async_word_generator(text)
        if msg_type != "followup_msg":
            for t in text.split():
                if t:
                    final_text += t
                    await self.sio.emit(
                        "new_message",
                        {
                            "mt": "chat_message_bot_partial",
                            "sid": self.sid,
                            "partial": t,
                        },
                    )

            await self.sio.emit(
                "new_message",
                {
                    "mt": "message_upload_confirm",
                    "sid": self.sid,
                    "message": text,
                    "time": current_time,
                    "isBot": True,
                },
            )
