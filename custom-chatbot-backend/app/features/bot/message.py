from requests import Session
from app.database import get_db
from app.features.bot.semantic_search import BotGraphSearch
from app.features.bot.utils.greeting_response import create_greetings_response
from app.features.bot.utils.local_semantic_similarity.auto_reply import can_auto_reply
from app.features.bot.utils.response import GeminiChat
from keybert import KeyBERT
from app.models.chunks import Chunk
from app.models.keywords import Keywords
from app.models.milvus.collection.milvus_collection import keyword_collection
# AIzaSyB0UjIOMxAH8DVQJWeojCIMXk2SmpSSmPQ

class BotMessage:
    """
    A class that handles writing messages for the bot.
    """

    def __init__(
        self,
        *,
        socket_response,
        sid: str,
        time_zone: str,
    ):
        self.socket_response = socket_response
        self.sid = sid
        self.time_zone = time_zone

    async def auto_reply_handler(
        self, last_user_text: str, auto_reply_type: str
    ) -> bool:
        """
        Handles if bot can reply directly to the user
        """
        if can_auto_reply(last_user_text):
            msg_type = None
            msg = create_greetings_response()
            print("msg=====>", msg)
            await self.socket_response.create_bot_response(
                msg,
                self.time_zone,
                None,
                msg_type="greetings_msg"
            )
            return True
        return False

    async def send_bot_message(self, text: str) -> bool:
        """
        Sends a bot message to the user
        :param text: the text the user sent
        :returns: whether the bot has sent the response or not
        """
        # Task for handling the main bot logic
        is_answer_found_and_sent_main_task = await self.bot_handler(text)
        return is_answer_found_and_sent_main_task

    async def bot_handler(self, user_input: str) -> bool:
        """
        Respond to the user input, optimizing the process of querying GPT-4.
        :param user_input: Text input from the user
        :return: Boolean indicating if the bot has responded or not
        """
        db = next(get_db())

        keyword_model = KeyBERT()

        if await self.auto_reply_handler(user_input, "greeting"):
            return False
        
        questions_list = [user_input.lower()]
        keyword=keyword_model.extract_keywords(user_input)
        print("keyword====>", keyword)
        keyword_list=[word[0] for word in keyword]
        print("keyword_list====>", keyword_list)
        is_result_found = False
        milvus_results = await self.milvus_search(db, questions_list, keyword_list)

        if milvus_results:
            is_result_found=await self.handle_keyword_milvus_response(db, milvus_results, user_input)
            if is_result_found:
                return False
            else:
                return True
        return True

            

        
        

    async def milvus_search(self, db: Session, questions_list, keyword_list):
        """
        Searches the Milvus database for the most similar question to the user input.      
        """
        
        milvus_results=await BotGraphSearch(db=db).search_keyword_vector(questions_list, keyword_collection)
        print("milvus_results====>", milvus_results)    
        return milvus_results
    
    async def handle_keyword_milvus_response(self, db: Session, keyword_ids:list[str], user_message:str):
        """
        Handles the response from the Milvus search.
        """
        
        result=db.query(Keywords.chunk_id).filter(Keywords.id.in_(keyword_ids)).all()
        print("result======>", result)
        chunk_ids=[]
        for res in result:
            ids=res[0].split(",")
            print("chunk_ids=====>", ids)
            chunk_ids.extend(ids)
        chunk_ids = list(set(map(int, chunk_ids)))
        print("chunk_ids====>", chunk_ids)
        if chunk_ids:
            chunk_result=db.query(Chunk.chunk).filter(Chunk.id.in_(chunk_ids)).all()
            print("chunk_result====>", chunk_result)
            chunk_details = [result.chunk for result in chunk_result]
            print("chunk_details====>", chunk_details)
            if len(chunk_details)>0:
                # response = await GeminiChat.ask_gemini(chunk_details, user_message)
                gemini_chat = GeminiChat()  # ✅ Create an instance
                response = await gemini_chat.ask_gemini(chunk_details, user_message)  # ✅ Call method on the instance
                print("response====>", response)
                await self.socket_response.create_bot_response(
                    response,
                    self.time_zone,
                    None,
                    msg_type="bot_msg"
                )
                return True
        return False
