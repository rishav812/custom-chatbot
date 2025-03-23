import asyncio
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from the .env file
load_dotenv()

# Retrieve the API key from the environment variable
api_key = os.getenv('API_KEY')

# Configure the generative AI model
genai.configure(api_key=api_key)


# async def generate_response(user_input : str, example_response: list[str] | None = None):
#     model = genai.GenerativeModel('gemini-1.5-flash')
#     response = model.generate_content(user_input)
#     response_text = response._result.candidates[0].content.parts[0].text
#     print("gemini-response====>", response_text)
#     return response_text

# import google.generativeai as genai

# Configure Gemini API
# genai.configure(api_key="YOUR_GEMINI_API_KEY")

class GeminiChat:
    def __init__(self):
        # self.api_key = api_key
        self.model_name = "gemini-1.5-flash"
        self.context_window = 128000  # Gemini's token limit
        self.max_output_tokens = 4096  # Adjust as needed

    def count_tokens(self, text):
        return int(len(text.split()) * 1.33)  # Approximate token count

    def split_messages(self, example_res: list[str]):
        print("example_res from split====>", example_res)
        split_example_res = []
        example_res_text = " ".join(example_res)  # Convert list to text

        example_tokens = self.count_tokens(example_res_text)
        
        if example_tokens + self.max_output_tokens > self.context_window:
            segments = (example_tokens + self.max_output_tokens) // self.context_window
            segment_length = len(example_res_text) // (segments + 1)

            start = 0
            for _ in range(segments):
                end = start + segment_length
                split_example_res.append(example_res_text[start:end])
                start = end
        else:
            split_example_res.append(example_res_text)

        return split_example_res

    # async def ask_gemini(self, example_response, user_query: str = ""):
    #     print(f"🔍 Debug: Type of self: {type(self)}")  # Add this line
    #     example_response_chunked = self.split_messages(example_response)
    #     responses = []

    #     for example_chunk in example_response_chunked:
    #         prompt = f"""
    #         You are AI Rishav, a knowledgeable and articulate assistant trained to provide insightful, well-structured, and engaging responses. Your primary role is to assist users by referring strictly to the provided reference data while maintaining a natural and conversational tone.

    #         Reference: {example_chunk}\n
    #         Question: {user_query}\n
    #         - Use the reference only to answer the question.
    #         - Respond in a professional yet conversational manner.
    #         - Provide a **detailed** response for every user input, covering all relevant aspects comprehensively.
    #         - Avoid phrases like "Based on the reference" or "As mentioned in the document."
    #         - If asked for an opinion, respond with confidence while staying within the reference.
    #         - If you cannot answer using the reference, say:
    #           "Great question! We will train AI Rishav to answer this next time."
    #         """

    #         model = genai.GenerativeModel(self.model_name)

    #         response = model.generate_content(prompt) 
    #         # response_stream = model.generate_content(prompt, stream=True)
    #         # Process response
    #         responses.append(response.text)
    #         print("gemini-response====>", responses)
    #         # for partial_response in response_stream:
    #         #     yield partial_response.text  # ✅ Yielding chunk instead of returning full response
    #         #     await asyncio.sleep(0.05)

    #     return responses[0]

    async def ask_gemini(self, example_response, user_query: str = ""):
        example_response_chunked = self.split_messages(example_response)

        async def response_generator():
            for example_chunk in example_response_chunked:
                prompt = f"""
                You are AI Rishav, a knowledgeable and articulate assistant trained to provide insightful, well-structured, and engaging responses. Your primary role is to assist users by referring strictly to the provided reference data while maintaining a natural and conversational tone.

                Reference: {example_chunk}\n
                Question: {user_query}\n
                - Use the reference only to answer the question.
                - Respond in a professional yet conversational manner.
                - Provide a **detailed** response for every user input, covering all relevant aspects comprehensively.
                - Avoid phrases like "Based on the reference" or "As mentioned in the document."
                - If asked for an opinion, respond with confidence while staying within the reference.
                - If you cannot answer using the reference, say:
                "Great question! We will train AI Rishav to answer this next time."
                """

                model = genai.GenerativeModel(self.model_name)

                response_stream = model.generate_content(prompt, stream=True)  # ✅ Ensure streaming

                # Yield response in chunks
                for partial_response in response_stream:
                    yield partial_response.text
                    print("gemini-response====>", partial_response.text)
                    await asyncio.sleep(0.1)  # ✅ Ensures async streaming

        return response_generator()  # ✅ Return async generator





