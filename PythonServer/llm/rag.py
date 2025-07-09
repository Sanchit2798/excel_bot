import os
from langchain_chroma import Chroma
import pdfplumber
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv
from langchain.retrievers import BM25Retriever
from llama_index.retrievers.bm25 import BM25Retriever
from llama_index.core import SimpleDirectoryReader
from llama_index.core.node_parser import SentenceSplitter
from llama_index.retrievers.bm25 import BM25Retriever
import Stemmer
# load_dotenv()

# class Document:
#     def __init__(self, content, metadata=None):
#         self.page_content = content
#         self.metadata = metadata if metadata is not None else {}

# # Load selected document

# def load_single_document(file_path):
#     # Print the start of the document loading process
#     print(f"Starting to load document from {file_path}")
    
#     if os.path.exists(file_path) and file_path.endswith(".pdf"):
#         # Print the filename of the PDF being processed
#         filename = os.path.basename(file_path)
#         print(f"Loading PDF file: {filename}")
        
#         with pdfplumber.open(file_path) as pdf:
#             full_text = []
#             # Print the number of pages in the PDF
#             print(f"Number of pages in PDF: {len(pdf.pages)}")
            
#             for page_number, page in enumerate(pdf.pages, start=1):
#                 page_text = page.extract_text()
#                 if page_text:
#                     full_text.append(page_text)
#                 # Print confirmation for each page processed
#                 print(f"Processed page {page_number}/{len(pdf.pages)}")
            
#             # Combine all pages' text into one string for the document
#             document_text = '\n'.join(full_text)
#             # Create a Document object with the content and optional metadata
#             document = Document(content=document_text, metadata={'filename': filename})
#             # Print that the document has been successfully created
#             print(f"Created document for {filename} with {len(full_text)} pages of text.")
#     else:
#         print(f"File not found or is not a PDF: {file_path}")
#         return None
    
#     return document


# 1. Create and Persist the BM25 Retriever
def create_and_persist_bm25_retriever(documents, persist_path="bm25_retriever_data"):
    """
    Creates a BM25 retriever from documents and persists it to disk.

    Args:
        documents (list): A list of llama_index.Document objects.
        persist_path (str): The directory to save the retriever.
    """
    # Ensure the persistence directory exists
    os.makedirs(persist_path, exist_ok=True)

    retriever = BM25Retriever.from_documents(documents, similarity_top_k=2)
    retriever.persist(persist_path)
    print(f"BM25 Retriever persisted to {persist_path}")


# 2. Load the BM25 Retriever from Disk
def load_bm25_retriever(persist_path="bm25_retriever_data"):
    """
    Loads a BM25 retriever from disk.

    Args:
        persist_path (str): The directory where the retriever was saved.

    Returns:
        BM25Retriever: The loaded BM25 retriever.
    """
    retriever = BM25Retriever.from_persist_dir(persist_path)
    print(f"BM25 Retriever loaded from {persist_path}")
    return retriever


# 3. Example Usage (Querying)
def query_bm25_retriever(retriever, query_text="document"):
    """
    Queries the BM25 retriever and prints the results.

    Args:
        retriever (BM25Retriever): The loaded BM25 retriever.
        query_text (str): The query string.
    """
    results = retriever.retrieve(query_text)
    print(f"Query: {query_text}")
    content = "".join([node.get_content() for node in results])
    return content

# Specify the path to the PDF file
# file_path = 'C:/Users/sanch/OneDrive/Desktop/LDSN/excel_bot/excel_bot/literature/RAG for apis.pdf'
# document = load_single_document(file_path)  # Load the document
# docs_list = [document]
# # Split it up
# text_splitter = RecursiveCharacterTextSplitter(chunk_size=7000, chunk_overlap=0)
# chunks = text_splitter.split_documents(docs_list)


# load documents
documents = SimpleDirectoryReader("C:/Users/sanch/OneDrive/Desktop/LDSN/excel_bot/excel_bot/api_documentation").load_data()
# initialize node parser
splitter = SentenceSplitter(chunk_size=512)
nodes = splitter.get_nodes_from_documents(documents)

# We can pass in the index, docstore, or list of nodes to create the retriever
bm25_retriever = BM25Retriever.from_defaults(
    nodes=nodes,
    similarity_top_k=2,
    # Optional: We can pass in the stemmer and set the language for stopwords
    # This is important for removing stopwords and stemming the query + text
    # The default is english for both
    stemmer=Stemmer.Stemmer("english"),
    language="english",
)

bm25_retriever.persist("./bm25_retriever")

loaded_bm25_retriever = BM25Retriever.from_persist_dir("./bm25_retriever")
query_bm25_retriever(loaded_bm25_retriever, "column width in excel")