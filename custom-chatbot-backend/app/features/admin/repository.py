import boto3
import os
import firebase_admin
from firebase_admin import credentials, storage
import PyPDF2
from app.features.admin.schemas import uploadDocuments
from sqlalchemy.orm import Session

from app.models.trainwell_document import TrainedDocument


# async def generate_presigned_url(filename: str, filetype: str):
#     print("fileType=======", filetype)
#     try:
#         s3_client = boto3.client(
#             "s3",
#             region_name=region_name,
#             aws_access_key_id=aws_access_key,
#             aws_secret_access_key=aws_secret_access_key,
#             config=boto3.session.Config(signature_version="v4"),
#         )
#         params = {
#             "Key": f"{filename}.pdf",
#             "Bucket": bucket_name,
#             "Expires": 3600,
#             "ContentType": "application/pdf",
#             "ACL": "public-read",
#         }
#         presigned_url = s3_client.generate_presigned_url(
#             ClientMethod="put_object", Params=params
#         )
#         print("presigned_url===>", presigned_url)
#         return {
#             "data": presigned_url,
#             "success": True,
#             "message": "generate_presigned_url.",
#         }
#     except Exception as e:
#         raise e


def download_pdf_from_firebase(pdf_file_path: str, local_file_name: str):
    bucket = storage.bucket()
    blob = bucket.blob(pdf_file_path)

    # Download the PDF to a local file
    blob.download_to_filename(local_file_name)
    return local_file_name


def extract_text_from_pdf(pdf_file_path: str):
    with open(pdf_file_path, "rb") as pdf_file:
        reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page_num in range(len(reader.pages)):
            page = reader.pages[page_num]
            text += page.extract_text()
    return text


async def read_and_train_private_file(
    data: uploadDocuments,
    db: Session,
):

    print("=================", data)
    new_document = TrainedDocument(
        url=data.signedUrl, name=data.fileName, status="pending"
    )
    pdf_file_path = f"pdf-bot-15cec.appspot.com"

    local_file_name = download_pdf_from_firebase(pdf_file_path, data.fileName)

    # Extract text from the downloaded PDF
    # extracted_text = extract_text_from_pdf(local_file_name)
    # print("extracted_text======", extracted_text)

    # Optionally, delete the local file after processing
    # os.remove(local_file_name)

    db.add(new_document)
    db.commit()
