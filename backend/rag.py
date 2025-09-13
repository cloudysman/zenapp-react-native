from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.retrieval import create_retrieval_chain
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import PGVector
from langchain_core.prompts import ChatPromptTemplate
from langchain_text_splitters import TextSplitter
from langchain.docstore.document import Document
from typing import Dict, Any
from dotenv import load_dotenv
import numpy as np
import json
import os


load_dotenv()
connection_string = os.getenv("PGVECTOR_CONNECTION_STRING")
google_api_key = os.getenv("GOOGLE_API_KEY")
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", 
                             temperature=0.3, 
                             google_api_key=google_api_key)

def load_json_to_documents(file_path: str) -> list[Document]:
    """
    Load JSON data and convert to LangChain Document objects.
    """  
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"Loaded {len(data)} items from JSON")
    
    documents = []
    for i, item in enumerate(data):
        page_content = item.get('content', '').strip()
        metadata = {
            "uuid": item.get('uuid', f"unknown_{i}"),
            "headers": item.get('headers', []),
            "summary": item.get('summary', ''),
            "keywords": item.get('keywords', [])
        }
        doc = Document(page_content=page_content, metadata=metadata)
        documents.append(doc)   

    print(f"Successfully created {len(documents)} Document objects")
    return documents
    
def create_and_store_embeddings(semantic_chunks: list[Document])->PGVector:
    collection_name = "fraudin4_signal"
    db = PGVector.from_documents(
        embedding=HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2"),
        documents=semantic_chunks,
        collection_name=collection_name,
        connection_string=connection_string,
        pre_delete_collection=True
    )
    print("Successfully created and stored embeddings in PGVector.")
    return db

if __name__ == "__main__":
    documents = load_json_to_documents("/home/hungdvlper/Documents/zenapp-react-native/data/data_completed-1.json")
    db = create_and_store_embeddings(documents);
    retriever = db.as_retriever()
    prompt = ChatPromptTemplate.from_messages([
    ("system", 
     "Bạn là một chuyên gia về  phòng chống tin giả và lừa đảo qua mạng. "
     "Dựa trên ngữ cảnh dưới đây, hãy trả lời câu hỏi của người dùng một cách chính xác và ngắn gọn.\n\n"
     "Ngữ cảnh:\n{context}\n\n"
     "Hướng dẫn:\n"
     "- Nếu câu trả lời có trong ngữ cảnh, hãy trích dẫn và giải thích rõ ràng.\n"
     "- Nếu ngữ cảnh không đủ thông tin, hãy trả lời: 'Xin lỗi, tôi không tìm thấy thông tin để trả lời câu hỏi này.'\n"
     "- Không được bịa ra thông tin không có trong ngữ cảnh."),
    ("user", "{input}")
    ])
    document_chain = create_stuff_documents_chain(llm, prompt)
    retrieval_chain = create_retrieval_chain(retriever, document_chain)

    question = "Các dấu hiệu để nhận biết nguồn tin đáng tin cậy?"
    print(f"\nProcessing user question: '{question}'")
    response = retrieval_chain.invoke({"input": question})
    print("\nCâu trả lời:")
    print(response["answer"])



