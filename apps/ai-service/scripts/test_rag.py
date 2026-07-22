import sys
import os
import asyncio

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from services.rag_service import rag_chat


async def main():
    query = "ধানের পাতায় দাগ হলে কী করব?"
    result = await rag_chat(query, language="bn")

    print(f"প্রশ্ন: {query}\n")
    print(f"উত্তর: {result['answer']}\n")
    print("সূত্র:")
    for s in result["sources"]:
        print(f"  - {s['content'][:60]}... (similarity: {s['metadata']['similarity']:.3f})")


asyncio.run(main())