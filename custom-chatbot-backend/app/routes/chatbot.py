from fastapi import APIRouter

router = APIRouter()


@router.get("/chatbot")
async def get_users():
    return [{"username": "user1"}, {"username": "user2"}]


# @router.get("//{user_id}")
# async def get_user(user_id: int):
#     return {"username": f"user{user_id}"}
