from app.features.bot.utils.greeting_response import create_greetings_response
from app.features.bot.utils.local_semantic_similarity.auto_reply import can_auto_reply


class BotMessage:
    """
    A class that handles writing messages for the bot.
    """

    def __init__(
        self,
        *,
        sid: str,
        time_zone: str,
    ):
        self.sid = sid
        self.time_zone = time_zone

    async def auto_reply_handler(
        self, last_user_text: str, auto_reply_type: str
    ) -> bool:
        """
        Handles if bot can reply directly to the user
        """
        if (can_auto_reply(last_user_text)):
            msg_type = None
            msg = create_greetings_response()
