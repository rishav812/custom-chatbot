from pydantic import BaseModel

class MessageData(BaseModel):
    time: str
    chatId: str
    message: str
    isBot: bool
    mt: str
