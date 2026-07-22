from langchain_core.retrievers import BaseRetriever
from langchain_core.documents import Document
from typing import List
from services.embedding_service import get_embedding
from services.vector_db import search_similar


class KnowledgeBaseRetriever(BaseRetriever):
    """
    আমাদের pgvector-based knowledge_base টেবিলকে LangChain-এর
    standard retriever interface-এ wrap করে, যাতে LangChain chain-এ ব্যবহার করা যায়
    """

    top_k: int = 3

    def _get_relevant_documents(self, query: str) -> List[Document]:
        query_embedding = get_embedding(query, is_query=True)
        results = search_similar(query_embedding, top_k=self.top_k)

        return [
            Document(
                page_content=r["content"],
                metadata={**r["metadata"], "similarity": r["similarity"]},
            )
            for r in results
        ]