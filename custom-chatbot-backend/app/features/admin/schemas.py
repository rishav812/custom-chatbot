from pydantic import BaseModel


class PreSignedUrl(BaseModel):
    fileFormat: str
