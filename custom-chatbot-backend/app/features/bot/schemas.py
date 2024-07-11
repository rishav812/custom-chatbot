from pydantic import BaseModel


class MessageUploadData(BaseModel):
    mt:str
    message:str
    isBot:bool
    timezone:str
    
class MessageData(BaseModel):
    time: str
    sid: str
    message: str
    isBot: bool
    mt: str

class MessagePartialUpload(BaseModel):
     mt: str
     sid: str
     partial:str
