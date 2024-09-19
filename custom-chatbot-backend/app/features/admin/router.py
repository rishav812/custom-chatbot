from fastapi import FastAPI, APIRouter, Depends, Request
from app.database import get_db
from sqlalchemy.orm import Session
from app.features.admin.repository import read_and_train_private_file
from app.features.admin.schemas import PreSignedUrl, uploadDocuments


router = APIRouter(tags=["Admin"], prefix="/admin")


@router.post("/pre-signed-url")
async def create_signed_url(
    request: Request,
    data: PreSignedUrl,
    db: Session = Depends(get_db),
):
    print("data===>", data.fileFormat)
    # return await generate_presigned_url(data.fileFormat, data.fileType)


@router.post("/upload-document")
async def upload_documents(
    request: Request,
    data: uploadDocuments,
    db: Session = Depends(get_db),
):
    print("data======", data)
    return await read_and_train_private_file(data, db)
