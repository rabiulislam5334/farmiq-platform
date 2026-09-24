import os
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAIEmbeddings

load_dotenv()

# ডিবাগিংয়ের জন্য প্রিন্ট (আউটপুটে দেখবেন কোন মডেল লোড হচ্ছে)
print("=== Loading Embedding Model: gemini-embedding-001 ===")

embeddings_model = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",  # নতুন মডেল
    google_api_key=os.getenv("GEMINI_API_KEY"),
)


def get_embedding(text: str, is_query: bool = False) -> list[float]:
    """
    টেক্সট-কে ভেক্টরে রূপান্তর করে Google Gemini-এর hosted API দিয়ে।
    """
    if is_query:
        return embeddings_model.embed_query(text)
    else:
        return embeddings_model.embed_documents([text])[0]