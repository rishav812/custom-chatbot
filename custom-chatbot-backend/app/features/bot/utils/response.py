import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from the .env file
load_dotenv()

# Retrieve the API key from the environment variable
api_key = os.getenv('API_KEY')

# Configure the generative AI model
genai.configure(api_key=api_key)


async def generate_response(user_input):
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content(user_input)
    response_text = response._result.candidates[0].content.parts[0].text
    print("gemini-response====>", response_text)
    return response_text



