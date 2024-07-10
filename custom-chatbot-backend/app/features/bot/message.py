from app.features.bot.utils.greeting_response import create_greetings_response
from app.features.bot.utils.local_semantic_similarity.auto_reply import can_auto_reply


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
        if await self.auto_reply_handler(user_input, "greeting"):
            return False
