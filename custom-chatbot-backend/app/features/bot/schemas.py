from pydantic import BaseModel


class MessageUploadData(BaseModel):
    mt:str
    message:str
    isBot:bool
    timezone:str
    
class MessageData(BaseModel):
    time: str
    chatId: str
    message: str
    isBot: bool
    mt: str
