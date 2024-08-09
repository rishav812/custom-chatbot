import boto3
import os

async def generate_presigned_url(filename: str):
    try:
        s3_client = boto3.client(
            "s3",
            region_name=region_name,
            aws_access_key_id=aws_access_key,
            aws_secret_access_key=aws_secret_access_key,
            config=boto3.session.Config(signature_version="v4"),
        )
        params = {
            "Key": f"document/{filename}",
            "Bucket": bucket_name,
            "Expires": 60*60,
            "content-type":"application/pdf",
            "ACL": "public-read"
        }
        presigned_url = s3_client.generate_presigned_url(
            ClientMethod="put_object", Params=params, HttpMethod="PUT"
        )
        print("presigned_url===>", presigned_url)
        return {
            "data": presigned_url,
            "success": True,
            "message": "generate_presigned_url.",
        }
        return presigned_url
    except Exception as e:
        raise e
