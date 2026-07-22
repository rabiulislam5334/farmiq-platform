import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from services.rag_retriever import KnowledgeBaseRetriever

load_dotenv()

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.3,  # RAG-এ কম temperature ভালো — retrieved fact থেকে বেশি বিচ্যুত না হয়ে উত্তর দেয়
)

retriever = KnowledgeBaseRetriever(top_k=3)

SYSTEM_PROMPT = {
    "bn": """তুমি FarmIQ এর AI কৃষি বিশেষজ্ঞ সহায়ক। নিচের প্রাসঙ্গিক তথ্যের ভিত্তিতে কৃষকের প্রশ্নের উত্তর দাও।

প্রাসঙ্গিক তথ্য:
{context}

নিয়ম:
- শুধু উপরের তথ্যের ভিত্তিতে উত্তর দাও, নিজে থেকে অনুমান করে কিছু বলো না
- উপরের তথ্যে উত্তর না থাকলে সততার সাথে বলো "এই বিষয়ে আমার কাছে নির্দিষ্ট তথ্য নেই"
- বাংলায়, সংক্ষিপ্ত এবং practical ভাষায় উত্তর দাও""",
    "en": """You are FarmIQ's AI agriculture expert. Answer the farmer's question based on the relevant information below.

Relevant information:
{context}

Rules:
- Only answer based on the information above, do not make assumptions
- If the information doesn't contain the answer, honestly say "I don't have specific information on this"
- Respond in English, concisely and practically""",
}


def format_docs(docs) -> str:
    """Retrieved documents-কে একটা readable context string-এ জোড়া দেয়"""
    if not docs:
        return "কোনো প্রাসঙ্গিক তথ্য পাওয়া যায়নি।"
    return "\n\n".join(f"- {doc.page_content}" for doc in docs)


async def rag_chat(message: str, language: str = "bn") -> dict:
    """
    RAG pipeline: query → retrieve relevant knowledge → LLM answer grounded in that knowledge
    """
    system_template = SYSTEM_PROMPT.get(language, SYSTEM_PROMPT["bn"])

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", system_template),
            ("human", "{question}"),
        ]
    )

    # LCEL (LangChain Expression Language) দিয়ে chain বানানো —
    # retriever → context format → prompt → LLM → string output, সব একটা pipeline-এ জোড়া
    docs = retriever.invoke(message)
    context = format_docs(docs)

    chain = prompt | llm | StrOutputParser()

    answer = await chain.ainvoke({"context": context, "question": message})

    return {
        "answer": answer,
        "sources": [
            {"content": doc.page_content, "metadata": doc.metadata} for doc in docs
        ],
    }