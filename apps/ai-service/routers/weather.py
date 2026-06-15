from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.weather_service import get_weather_advisory

router = APIRouter(prefix="/weather", tags=["Weather Advisory"])


class WeatherRequest(BaseModel):
    location: str
    language: str = "bn"


@router.post("/advisory")
async def weather_advisory(body: WeatherRequest):
    if not body.location.strip():
        raise HTTPException(status_code=400, detail="Location cannot be empty")

    try:
        result = await get_weather_advisory(
            location=body.location,
            language=body.language,
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))