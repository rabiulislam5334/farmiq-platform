import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from services.embedding_service import get_embedding
from services.vector_db import insert_knowledge, search_similar, get_connection

# প্রতিবার script চালালে পুরনো test data মুছে fresh শুরু করি (duplicate এড়াতে)
def clear_knowledge_base():
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("TRUNCATE TABLE knowledge_base")
        conn.commit()
    finally:
        conn.close()

clear_knowledge_base()
print("Cleared old data.\n")

sample_knowledge = [
    {
        "content": "ধান গাছের পাতায় বাদামী দাগ দেখা দিলে এটি Brown Spot রোগের লক্ষণ। প্রতিকার হিসেবে Mancozeb জাতীয় ছত্রাকনাশক স্প্রে করতে হবে এবং জমিতে পটাশ সারের পরিমাণ বাড়াতে হবে।",
        "metadata": {"crop": "rice", "topic": "disease", "disease": "brown_spot"},
    },
    {
        "content": "গমের আদর্শ বপনের সময় নভেম্বরের মাঝামাঝি থেকে ডিসেম্বরের প্রথম সপ্তাহ। দেরিতে বপন করলে ফলন উল্লেখযোগ্যভাবে কমে যায়।",
        "metadata": {"crop": "wheat", "topic": "planting_schedule"},
    },
    {
        "content": "টমেটো গাছে পোকার আক্রমণ ঠেকাতে নিমতেল স্প্রে একটি কার্যকর জৈব পদ্ধতি, সপ্তাহে দুইবার প্রয়োগ করতে হবে।",
        "metadata": {"crop": "tomato", "topic": "pest_control"},
    },
]

print("Inserting sample knowledge...")
for item in sample_knowledge:
    embedding = get_embedding(item["content"])  # document/passage embedding, is_query=False (default)
    insert_knowledge(item["content"], embedding, item["metadata"])
    print(f"  ✓ Inserted: {item['content'][:50]}...")

print("\nTesting search...")
query = "ধানের পাতায় দাগ হলে কী করব?"
query_embedding = get_embedding(query, is_query=True)  # এটাই মূল fix — query হিসেবে embed করা
results = search_similar(query_embedding, top_k=3)

print(f"\nQuery: {query}")
for r in results:
    print(f"  Similarity: {r['similarity']:.3f} | {r['content'][:60]}...")