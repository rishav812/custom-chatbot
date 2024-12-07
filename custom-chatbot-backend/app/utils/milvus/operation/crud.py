from app.models.milvus.collection.milvus_collection import create_collection
from sentence_transformers import SentenceTransformer

msmarco_model = SentenceTransformer("msmarco-distilbert-base-tas-b")
keyword_collection=None

def initialize_milvus_collection():
    global keyword_collection
    if keyword_collection is None:
        keyword_collection = create_collection()


def _insert_keywords_to_milvus(pg_ids: list[int], data: list[str]):
    print("enter in chroma-function=======================")
    for i in range(0, len(data)):
        chunk = [data[i]]
       
        # Generate embeddings using the MSMARCO model
        msmarco_embeddings = msmarco_model.encode(chunk, normalize_embeddings=True)
        pg_id_chunk = [pg_ids[i]]  
        insert_data = [pg_id_chunk, msmarco_embeddings.tolist()]  # ID  # Embeddings
        keyword_collection.insert(insert_data)