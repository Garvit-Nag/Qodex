import chromadb
from chromadb.config import Settings
import os
from typing import List, Dict, Optional
import logging
import numpy as np

logger = logging.getLogger(__name__)

class VectorService:
    def __init__(self):
        self.client = chromadb.PersistentClient(
            path="./chroma_db",
            settings=Settings(
                anonymized_telemetry=False,
                allow_reset=True
            )
        )
        logger.info("🗄️ ChromaDB client initialized")
    
    def create_collection(self, repository_id: int) -> chromadb.Collection:
        collection_name = f"repo_{repository_id}"
        
        try:
            collection = self.client.get_collection(collection_name)
            logger.info(f"📚 Using existing collection: {collection_name}")
        except:
            collection = self.client.create_collection(
                name=collection_name,
                metadata={"repository_id": repository_id}
            )
            logger.info(f"🆕 Created new collection: {collection_name}")
        
        return collection
    
    async def store_embeddings(self, repository_id: int, embedded_chunks: List[Dict]):
        logger.info(f"💾 Storing {len(embedded_chunks)} embeddings for repository {repository_id}")
        
        collection = self.create_collection(repository_id)
        
        documents = []
        embeddings = []
        metadatas = []
        ids = []
        
        for i, chunk in enumerate(embedded_chunks):
            chunk_id = f"chunk_{repository_id}_{chunk['chunk_index']}_{i}"
            
            documents.append(chunk['content'])
            embeddings.append(chunk['embedding'])
            metadatas.append({
                'file_path': chunk['file_path'],
                'start_line': chunk['start_line'],
                'end_line': chunk['end_line'],
                'chunk_type': chunk['chunk_type'],
                'content_length': chunk['content_length'],
                'repository_id': repository_id
            })
            ids.append(chunk_id)
        
        batch_size = 100
        for i in range(0, len(documents), batch_size):
            end_idx = min(i + batch_size, len(documents))
            
            collection.add(
                documents=documents[i:end_idx],
                embeddings=embeddings[i:end_idx],
                metadatas=metadatas[i:end_idx],
                ids=ids[i:end_idx]
            )
        
        logger.info(f"✅ Successfully stored all embeddings for repository {repository_id}")
    
    async def search_similar_code(self, repository_id: int, query_embedding: List[float], top_k: int = 5) -> List[Dict]:
        collection_name = f"repo_{repository_id}"
        
        try:
            collection = self.client.get_collection(collection_name)
        except:
            logger.warning(f"⚠️ Collection {collection_name} not found")
            return []
        
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k,
            include=['documents', 'metadatas', 'distances']
        )
        
        search_results = []
        for i in range(len(results['documents'][0])):
            # Fix similarity calculation
            distance = results['distances'][0][i]
            # Convert distance to similarity (higher is better)
            similarity = max(0.0, 1.0 - distance)  # Ensure positive similarity
            
            search_results.append({
                'content': results['documents'][0][i],
                'metadata': results['metadatas'][0][i],
                'similarity': similarity,
                'file_path': results['metadatas'][0][i]['file_path'],
                'start_line': results['metadatas'][0][i]['start_line'],
                'end_line': results['metadatas'][0][i]['end_line']
            })
        
        # Sort by similarity (highest first)
        search_results.sort(key=lambda x: x['similarity'], reverse=True)
        
        logger.info(f"🔍 Found {len(search_results)} similar code chunks")
        return search_results
    
    def delete_repository_data(self, repository_id: int):
        collection_name = f"repo_{repository_id}"
        
        try:
            self.client.delete_collection(collection_name)
            logger.info(f"🗑️ Deleted collection: {collection_name}")
        except:
            logger.warning(f"⚠️ Collection {collection_name} not found for deletion")