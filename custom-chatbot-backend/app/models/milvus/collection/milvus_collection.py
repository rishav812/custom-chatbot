from pymilvus import (
    connections,
    CollectionSchema,
    FieldSchema,
    DataType,
    Collection,
)
from pymilvus.exceptions import ConnectionNotExistException



def create_collection():
    fields = [
        FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
        FieldSchema(
            name="pg_id",
            dtype=DataType.INT64,
        ),
        FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=768),
    ]
    schema = CollectionSchema(fields=fields)
    collection = None
    try:
        collection = Collection(name="keywords_collection", schema=schema)
        if not collection.has_index():
            collection.create_index(
                field_name="vector",
                # https://milvus.io/docs/build_index.md
                index_params={
                    "metric_type": "IP",
                    "index_type": "IVF_FLAT",
                    "params": {"nlist": 1024},
                },
            )
        collection.load()

    except ConnectionNotExistException:
        print("error in milvus connection") 
    return collection