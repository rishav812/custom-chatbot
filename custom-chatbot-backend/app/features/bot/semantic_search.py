from pymilvus import Collection
from requests import Session
from sentence_transformers import SentenceTransformer
from asgiref.sync import sync_to_async

from app.common import constants

msmarco_model = SentenceTransformer("msmarco-distilbert-base-tas-b")

class BotGraphSearch:
    def __init__(self,*, db: Session):
        self.db = db
    
    async def get_milvus_results(self, keyword: str, collection: "Collection"):
        try:
            keyword_vector = msmarco_model.encode(keyword,normalize_embeddings=True).tolist()
            response = await sync_to_async(collection.search)(
            data=[keyword_vector],  # Query vector
            anns_field="vector",  # The vector field in the collection
            param={"metric_type": "IP", "params": {"nprobe": 10}},  # Search params
            limit=2,  # Number of results to return
            output_fields=["id", "pg_id"],  # Fields to return
        )

            return response
        except Exception as e:
            print(f"Error in searching milvus: {e}")
            return None
    
    def filter_ids(self, milvus_res, distance_limit):
            # ids = [res.id for res in milvus_res if res.distance < distance_limit]
        if milvus_res is not None:
            pg_ids = [
            hit.entity.pg_id  # Access `pg_id` as an attribute, not as a dictionary key
            for hits in milvus_res
            for hit in hits
            if hit.distance > distance_limit
        ]

        return pg_ids
        # return filtered_answer_ids
    
    async def search_keyword_vector(self, keywords: list[str], collection: "Collection"):
        answer_ids = []
        for keyword in keywords:
            milvus_res = await self.get_milvus_results(keyword, collection)
            print("milvus_res====>", milvus_res)
            new_ids=await sync_to_async(self.filter_ids)(milvus_res,constants.MILVUS_DISTANCE_LIMIT)
            answer_ids = answer_ids + new_ids 
        
        if len(answer_ids) > 0:
            print("answer_ids====>", answer_ids)
            return list(set(answer_ids))
            
        return None