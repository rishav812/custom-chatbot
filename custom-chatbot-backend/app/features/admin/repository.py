import boto3
import os

from app.features.admin.schemas import uploadDocuments
from sqlalchemy.orm import Session

from app.models.trainwell_document import TrainwellDocument


async def generate_presigned_url(filename: str, filetype: str):
    print("fileType=======", filetype)
    try:
        s3_client = boto3.client(
            "s3",
            region_name=region_name,
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_access_key,
            config=boto3.session.Config(signature_version="v4"),
        )
        params = {
            "Key": f"{filename}.pdf",
            "Bucket": bucket_name,
            "Expires": 3600,
            "ContentType": "application/pdf",
            "ACL": "public-read",
        }
        presigned_url = s3_client.generate_presigned_url(
            ClientMethod="put_object", Params=params
        )
        print("presigned_url===>", presigned_url)
        return {
            "data": presigned_url,
            "success": True,
            "message": "generate_presigned_url.",
        }
    except Exception as e:
        raise e


async def read_and_train_private_file(
    data: uploadDocuments,
    db: Session,
):
    print("=================",data)
    new_document = TrainwellDocument(
        user_id=1, url=data.signedUrl, name=data.fileName, status="pending"
    )

    db.add(new_document)
    db.commit()
