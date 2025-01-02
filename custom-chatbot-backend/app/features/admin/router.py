from fastapi import FastAPI, APIRouter, Depends, Request
from app.database import get_db
from sqlalchemy.orm import Session
from app.features.admin.repository import check_status, get_all_uploaded_documents, read_and_train_private_file
from app.features.admin.schemas import DocumentListSchema, PreSignedUrl, uploadDocuments


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
    return await read_and_train_private_file(data, db)

@router.get("/get-all-docs")
async def get_all_documents(db: Session = Depends(get_db)):
    return await get_all_uploaded_documents(db)


@router.post("/check-doc-status")
async def check_document_status(
    request: Request, data: DocumentListSchema, db: Session = Depends(get_db)
):
    # print("data===>", data)
    # return {
    #     "data": [],
    #     "success": True,
    #     "message": "status retrieved successfully.",
    # }
    return await check_status(data, db)
