from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.retrieval import create_retrieval_chain
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import PGVector
from langchain_core.prompts import ChatPromptTemplate
from langchain.docstore.document import Document
import json
import os

connection_string = os.getenv("PGVECTOR_CONNECTION_STRING")
google_api_key = os.getenv("GOOGLE_API_KEY")

class FraudDetectionRAG:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            temperature=0.3,
            google_api_key="AIzaSyD9bDeOvWtyDD7G4qJdCYtB60dlrx2mHqg"
        )
        self.db = self._init_vector_store()
        self.retrieval_chain = self._create_chain()
    
    def _init_vector_store(self):
        # Load existing PGVector database
        return PGVector(
            embedding_function=HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2"),
            collection_name="fraudin4_signal",
            connection_string=connection_string
        )
    
    def _create_chain(self):
        retriever = self.db.as_retriever()
        prompt = ChatPromptTemplate.from_messages([
            ("system", "Bạn là chuyên gia phòng chống tin giả..."),  # Your prompt
            ("user", "{input}")
        ])
        document_chain = create_stuff_documents_chain(self.llm, prompt)
        return create_retrieval_chain(retriever, document_chain)
    
    def query(self, question: str):
        response = self.retrieval_chain.invoke({"input": question})
        return response["answer"]