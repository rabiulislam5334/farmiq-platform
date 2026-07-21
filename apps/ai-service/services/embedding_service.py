from sentence_transformers import SentenceTransformer

# e5 সিরিজ multilingual model — বাংলা technical/mixed-language text-এ ভালো ফল দেয়
_model = SentenceTransformer("intfloat/multilingual-e5-small")


def get_embedding(text: str, is_query: bool = False) -> list[float]:
    """
    একটা text-কে 384-dimension vector-এ রূপান্তর করে।
    e5 model-এর নিয়ম অনুযায়ী query আর document-এর জন্য আলাদা prefix লাগে।
    """
    prefix = "query: " if is_query else "passage: "
    embedding = _model.encode(prefix + text)
    return embedding.tolist()