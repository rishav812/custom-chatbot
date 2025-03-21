from pymilvus import connections as milvus_connections

milvus_alias = "default"


def connect_to_milvus():
    global milvus_alias
    milvus_connections.connect(
        alias=milvus_alias,
        host="localhost",
        port="19530",
    )


def disconnect_from_milvus():
    global milvus_alias
    milvus_connections.disconnect(alias=milvus_alias)