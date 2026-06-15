from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

LANG_MAP = {
    "bn": "বাংলায়",
    "en": "in English",
}

SYSTEM_PROMPT = {
    "bn": """তুমি FarmIQ এর AI কৃষি সহায়ক। তুমি বাংলাদেশের কৃষকদের সাহায্য করো।
সবসময় বাংলায় উত্তর দাও। সংক্ষিপ্ত, practical এবং সহজ ভাষায় বলো।
শুধু কৃষি সম্পর্কিত প্রশ্নের উত্তর দাও।""",

    "en": """You are FarmIQ's AI agriculture assistant helping farmers in Bangladesh.
Always respond in English. Keep answers concise, practical and simple.
Only answer agriculture-related questions.""",
}


async def chat(
    message: str,
    language: str = "bn",
    history: list = [],
) -> str:
    """Multilingual farming chatbot using Groq Llama 3"""

    system = SYSTEM_PROMPT.get(language, SYSTEM_PROMPT["bn"])

    messages = [{"role": "system", "content": system}]

    # Chat history add করো
    for h in history[-6:]:  # last 6 messages (3 turns)
        messages.append({"role": h["role"], "content": h["content"]})

    messages.append({"role": "user", "content": message})

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=1024,
        temperature=0.7,
    )

    return response.choices[0].message.content