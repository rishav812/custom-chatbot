from app.models.chunks import Chunk
from datetime import datetime
import threading
import ai21
import boto3
import os
import firebase_admin
from firebase_admin import credentials, storage
import PyPDF2
from keybert import KeyBERT
from app.database import get_db
from app.features.admin.schemas import uploadDocuments
from sqlalchemy.orm import Session
from langchain_ai21 import AI21SemanticTextSplitter
from app.models.trained_document import TrainedDocument
from app.models.keywords import Keywords
import os
from dotenv import load_dotenv

from app.utils.milvus.operation.crud import _insert_keywords_to_milvus

 
cred = credentials.Certificate("./app/config/serviceAccountKey.json")
firebase_admin.initialize_app(cred, {"storageBucket": "pdf-bot-15cec.appspot.com"})
ai21_api_key = os.getenv('AI21_API_KEY')

 
def download_pdf_from_firebase(pdf_file_path: str, local_file_name: str):
    bucket = storage.bucket()
    blob = bucket.blob(pdf_file_path)
    print("blob======", blob)
 
    # Download the PDF to a local file
    if blob.exists():
        blob.download_to_filename(local_file_name)
    else:
        print(f"File {pdf_file_path} does not exist in Firebase Storage.")
    return local_file_name
 
 
def extract_text_from_pdf(pdf_file_path: str):
    with open(pdf_file_path, "rb") as pdf_file:
        reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page_num in range(len(reader.pages)):
            page = reader.pages[page_num]
            text += page.extract_text()
    return text
 
 
def generate_keywords(complete_text, keyword_model):
 
    keywords = keyword_model.extract_keywords(complete_text)
    keywords_list = [word[0] for word in keywords]
    keywords_string = ",".join(keywords_list)
    return keywords_string, keywords_list

def train_document(text, document_id):
    try:
        db = next(get_db())
        keyword_model = KeyBERT()
        milvus_batch_data = []
        
        chunks = AI21SemanticTextSplitter(
            api_key= ai21_api_key, chunk_size=1000
        ).split_text(text)

        print(f"The text has been splits into {len(chunks)} chunks")

        for chunk in chunks:
            print("chunk=====",chunk)
            keywords_string, keyword_list = generate_keywords(
                chunk,
                keyword_model,
            )
            print("keyword_list============",keyword_list)
            chunk = Chunk(
                keywords=keywords_string,
                chunk=chunk,
                training_document_id=document_id,
                created_ts=datetime.now(),
                updated_ts=datetime.now(),
            )
            db.add(chunk)
            db.commit()

            print(f"Chunk with id {chunk.id} is insert successfully")
            chunk_id=str(chunk.id)
            insert_to_keywords_table(db, keyword_list, chunk_id)

    except Exception as e:
        print(e, "error in read_and_train_private_file")
        return {"message": "Something went wrong", "success": False, "error": e}
 
 
async def read_and_train_private_file(
    data: uploadDocuments,
    db: Session,
):
    pdf_file_path = f"{data.fileName}.pdf"
    local_file_name = f"temp_{data.fileName}.pdf"
 
    local_file_name = download_pdf_from_firebase(pdf_file_path, local_file_name)
 
    # Extract text from the downloaded PDF
    extracted_text = extract_text_from_pdf(local_file_name)
 
    # Optionally, delete the local file after processing
    os.remove(local_file_name)

 
    new_document = TrainedDocument(
        url=data.signedUrl, name=data.fileName, status="pending"
    )
 
    db.add(new_document)
    db.commit()

    if new_document and new_document.id:
            thread = threading.Thread(target=train_document, args=(extracted_text,
                    new_document.id,))
            thread.start()
            return {
                "data": new_document,
                "message": "document added successfully",
                "success": True,
            }
    return {"message": "Something went wrong", "success": False}

def insert_to_keywords_table(db, words:list[str], chunkId:str):
    try:
        pg_id_array = []
        keywords_array = []
        for word in words:
            existing_keyword=(
                db.query(Keywords).filter(Keywords.name==word.lower()).first()
            )
            if existing_keyword and existing_keyword.id:
                existing_chunk_ids = existing_keyword.chunk_id.split(",")
                existing_chunk_ids.append(str(chunkId))

                existing_keyword.chunk_id = ",".join(existing_chunk_ids)
                existing_keyword.updated_ts = datetime.now()
                db.commit()
                print(f"Keyword with id {existing_keyword.id} is update successfully")
            
            else:
                new_keyword = Keywords(
                    name=word.lower(),
                    chunk_id=chunkId,
                    created_ts=datetime.now(),
                )
                db.add(new_keyword)
                db.commit()
                print(f"Keyword with id {new_keyword.id} is insert successfully")
                pg_id_array.append(new_keyword.id)
                keywords_array.append(word)
        
        print("keywords_array===>",len(keywords_array), keywords_array,pg_id_array)
            
        if len(keywords_array):
            print("insert_keywords_to_chroma========================")
            _insert_keywords_to_milvus(pg_id_array, keywords_array)

    except Exception as e:
        print(e, "error in insert_to_keywords_table")

     
