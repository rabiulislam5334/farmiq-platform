import os
import json
import psycopg2
from psycopg2.extras import Json
from dotenv import load_dotenv

load_dotenv()


def get_connection():
    """Supabase Postgres-এর সাথে psycopg2 সামঞ্জস্যপূর্ণ connection বানায়"""
    db_url = os.getenv("DATABASE_URL")

    # psycopg2 'no-verify' সাপোর্ট করে না, তাই এটিকে 'require'-এ কনভার্ট করা হচ্ছে
    if db_url and "sslmode=no-verify" in db_url:
        db_url = db_url.replace("sslmode=no-verify", "sslmode=require")

    return psycopg2.connect(db_url)


def insert_knowledge(content: str, embedding: list[float], metadata: dict = None):
    """একটা knowledge chunk আর তার embedding vector database-এ save করে"""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO knowledge_base (content, metadata, embedding)
                VALUES (%s, %s::jsonb, %s)
                """,
                (content, json.dumps(metadata or {}), embedding),
            )
        conn.commit()
    finally:
        conn.close()


def search_similar(query_embedding: list[float], top_k: int = 3):
    """Query embedding-এর সাথে সবচেয়ে কাছাকাছি (cosine similarity) knowledge chunk খুঁজে বের করে"""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT content, metadata, 1 - (embedding <=> %s::vector) AS similarity
                FROM knowledge_base
                ORDER BY embedding <=> %s::vector
                LIMIT %s
                """,
                (query_embedding, query_embedding, top_k),
            )
            rows = cur.fetchall()
            return [
                {"content": r[0], "metadata": r[1], "similarity": float(r[2])}
                for r in rows
            ]
    finally:
        conn.close()