from datetime import datetime
from typing import List
from pydantic import BaseModel


class PreSignedUrl(BaseModel):
    fileFormat: str
    fileType:str


class uploadDocuments(BaseModel):
    fileName: str
    signedUrl: str

# class documentsIds(BaseModel):
#     List[int]


class DocumentSchema(BaseModel):
    id: int

# Schema for an array of DocumentSchema objects
class DocumentListSchema(BaseModel):
    payload: List[DocumentSchema]
