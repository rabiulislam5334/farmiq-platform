import google.generativeai as genai
import os
from dotenv import load_dotenv
import PIL.Image
import io
import json

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-2.0-flash")

LANG_MAP = {
    "bn": "বাংলায়",
    "en": "in English",
}


async def analyze_crop_disease(image_bytes: bytes, language: str = "bn") -> dict:
    image = PIL.Image.open(io.BytesIO(image_bytes))
    lang = LANG_MAP.get(language, "বাংলায়")

    prompt = f"""
তুমি একজন কৃষি বিশেষজ্ঞ। এই ছবিতে ফসলের কোনো রোগ আছে কিনা বিশ্লেষণ করো।
{lang} উত্তর দাও। শুধু JSON format এ উত্তর দাও:
{{
  "disease": "রোগের নাম",
  "confidence": 0.95,
  "severity": "low/medium/high",
  "advice": "প্রতিকারের বিস্তারিত পরামর্শ"
}}
যদি কোনো রোগ না থাকে, disease এ "Healthy Crop" লিখো।
"""

    response = model.generate_content([prompt, image])
    text = response.text.strip()

    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()

    return json.loads(text)


async def chat_with_ai(message: str, language: str = "bn") -> str:
    lang = LANG_MAP.get(language, "বাংলায়")
    prompt = f"তুমি FarmIQ এর AI কৃষি সহায়ক। {lang} উত্তর দাও।\n\nপ্রশ্ন: {message}"
    response = model.generate_content(prompt)
    return response.text.strip()