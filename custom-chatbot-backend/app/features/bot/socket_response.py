from datetime import datetime
import json
import re
from uuid import uuid4
from fastapi import logger
import socketio
from typing import Optional
from collections.abc import AsyncGenerator

from app.features.bot.schemas import MessageData, MessagePartialUpload


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
        print("text===>", text,"typee===============",type(text))
        # text = self.async_word_generator(text)
        if msg_type != "followup_msg":
            for t in text:
                if t:
                    final_text += t
                    message = MessagePartialUpload(
                        mt="chat_message_bot_partial", 
                        sid=self.sid, 
                        partial=t
                    )
                    await self.sio.emit("new_message", json.dumps(message.dict()))

            message = MessageData(
                time=current_time,
                sid=self.sid,
                message=text,
                isBot=True,
                mt="message_upload_confirm",
            )

            await self.sio.emit("new_message", json.dumps(message.dict()))
