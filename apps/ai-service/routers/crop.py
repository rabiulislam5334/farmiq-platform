from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from services.gemini_service import analyze_crop_disease

router = APIRouter(prefix="/analyze", tags=["Crop Analysis"])


@router.post("/crop-disease")
async def detect_disease(
    image: UploadFile = File(...),
    language: str = Form("bn"),
):
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files allowed")

    image_bytes = await image.read()

    try:
        result = await analyze_crop_disease(image_bytes, language)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))