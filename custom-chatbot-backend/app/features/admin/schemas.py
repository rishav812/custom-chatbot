from pydantic import BaseModel


class PreSignedUrl(BaseModel):
    fileFormat: str
    fileType:str


class uploadDocuments(BaseModel):
    fileName: str
    signedUrl: str
