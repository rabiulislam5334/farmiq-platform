import httpx
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

LANG_MAP = {
    "bn": "বাংলায়",
    "en": "in English",
}


async def get_weather(location: str) -> dict:
    api_key = os.getenv("OPENWEATHER_API_KEY")
    url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={api_key}&units=metric"

    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        if response.status_code != 200:
            raise Exception(f"Weather API error: {response.text}")
        return response.json()


async def get_weather_advisory(location: str, language: str = "bn") -> dict:
    lang = LANG_MAP.get(language, "বাংলায়")

    weather = await get_weather(location)

    temp = weather["main"]["temp"]
    humidity = weather["main"]["humidity"]
    description = weather["weather"][0]["description"]
    wind_speed = weather["wind"]["speed"]

    prompt = f"""তুমি একজন কৃষি বিশেষজ্ঞ। নিচের আবহাওয়া দেখে কৃষকদের জন্য {lang} সংক্ষিপ্ত পরামর্শ দাও।

আবহাওয়া:
- তাপমাত্রা: {temp}°C
- আর্দ্রতা: {humidity}%
- অবস্থা: {description}
- বাতাস: {wind_speed} m/s
- অবস্থান: {location}"""

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=512,
    )

    return {
        "location": location,
        "weather": {
            "temperature": temp,
            "humidity": humidity,
            "description": description,
            "wind_speed": wind_speed,
        },
        "advisory": response.choices[0].message.content,
        "language": language,
    }