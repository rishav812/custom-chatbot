from fastapi import FastAPI, APIRouter, Depends, Request

from app.features.admin.schemas import PreSignedUrl


router = APIRouter(tags=["Admin"], prefix="/admin")


@router.post("/pre-signed-url")
async def create_signed_url(
    request: Request,
    data: PreSignedUrl,
):
    print("data===>",data.fileFormat)
    return {"message": "Hello World"}



@router.get("/get-user")
async def create_signed_url(
    request: Request,
):
    # print("data===>", data.fileFormat)
    return {"message": "Hello World"}
