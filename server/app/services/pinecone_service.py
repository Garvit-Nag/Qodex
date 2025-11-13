from pinecone import Pinecone, ServerlessSpec
from typing import List, Dict, Optional
import logging
import os
from app.core.config import settings

logger = logging.getLogger(__name__)

class PineconeService:
    def __init__(self):
        try:
            print("🔧 [PINECONE] Initializing Pinecone client...", flush=True)
            
            if not settings.pinecone_api_key:
                raise Exception("PINECONE_API_KEY environment variable is required")
            
            self.pc = Pinecone(api_key=settings.pinecone_api_key)
            
            self.index_name = settings.pinecone_index_name
            self._ensure_index_exists()
            
            self.index = self.pc.Index(self.index_name)
            
            print(f"✅ [PINECONE] Connected to index: {self.index_name}", flush=True)
            logger.info(f"🎯 Pinecone service initialized with index: {self.index_name}")
            
        except Exception as e:
            print(f"❌ [PINECONE] Failed to initialize: {e}", flush=True)
            logger.error(f"❌ Failed to initialize Pinecone: {e}")
            raise Exception(f"Failed to initialize Pinecone: {e}")
    
    def _ensure_index_exists(self):
        """Create index if it doesn't exist"""
        try:
            existing_indexes = [index.name for index in self.pc.list_indexes()]
            
            if self.index_name not in existing_indexes:
                print(f"🆕 [PINECONE] Creating new index: {self.index_name}", flush=True)
                
                self.pc.create_index(
                    name=self.index_name,
                    dimension=384,  
                    metric='cosine',
                    spec=ServerlessSpec(
                        cloud='aws',
                        region='us-east-1'
                    )
                )
                
                print(f"✅ [PINECONE] Index created successfully: {self.index_name}", flush=True)
            else:
                print(f"📚 [PINECONE] Using existing index: {self.index_name}", flush=True)
                
        except Exception as e:
            print(f"❌ [PINECONE] Error with index: {e}", flush=True)
            raise
    
    async def store_embeddings(self, repository_id: int, embedded_chunks: List[Dict]):
        """Store embeddings in Pinecone with repository namespace"""
        print(f"💾 [PINECONE] Storing {len(embedded_chunks)} embeddings for repository {repository_id}", flush=True)
        logger.info(f"💾 Storing {len(embedded_chunks)} embeddings for repository {repository_id}")
        
        try:
            vectors = []
            for i, chunk in enumerate(embedded_chunks):
                vector_id = f"repo_{repository_id}_chunk_{chunk['chunk_index']}_{i}"
                
                vector = {
                    "id": vector_id,
                    "values": chunk['embedding'],
                    "metadata": {
                        "repository_id": repository_id,
                        "file_path": chunk['file_path'],
                        "start_line": chunk['start_line'],
                        "end_line": chunk['end_line'],
                        "chunk_type": chunk['chunk_type'],
                        "content_length": chunk['content_length'],
                        "content": chunk['content'][:1000] 
                    }
                }
                vectors.append(vector)
            
            batch_size = 100
            total_batches = (len(vectors) + batch_size - 1) // batch_size
            
            for batch_num, i in enumerate(range(0, len(vectors), batch_size), 1):
                end_idx = min(i + batch_size, len(vectors))
                batch_vectors = vectors[i:end_idx]
                
                self.index.upsert(
                    vectors=batch_vectors,
                    namespace=f"repo_{repository_id}"
                )
                
                print(f"✅ [PINECONE] Stored batch {batch_num}/{total_batches} ({len(batch_vectors)} vectors)", flush=True)
            
            print(f"🎉 [PINECONE] Successfully stored all {len(embedded_chunks)} embeddings for repository {repository_id}!", flush=True)
            logger.info(f"✅ Successfully stored all embeddings for repository {repository_id}")
            
        except Exception as e:
            print(f"❌ [PINECONE] Error storing embeddings: {e}", flush=True)
            logger.error(f"❌ Error storing embeddings in Pinecone: {e}")
            raise
    
    async def search_similar_code(self, repository_id: int, query_embedding: List[float], top_k: int = 5) -> List[Dict]:
        """Search for similar code using Pinecone"""
        try:
            print(f"🔍 [PINECONE] Searching for {top_k} similar chunks in repository {repository_id}", flush=True)
            

            results = self.index.query(
                vector=query_embedding,
                top_k=top_k,
                namespace=f"repo_{repository_id}",
                include_metadata=True,
                include_values=False
            )
            
            search_results = []
            for match in results.matches:
                similarity = match.score  
                metadata = match.metadata
                
                search_results.append({
                    'content': metadata.get('content', ''),
                    'metadata': metadata,
                    'similarity': similarity,
                    'file_path': metadata.get('file_path', ''),
                    'start_line': metadata.get('start_line', 0),
                    'end_line': metadata.get('end_line', 0)
                })
            
            print(f"✅ [PINECONE] Found {len(search_results)} similar code chunks", flush=True)
            logger.info(f"🔍 Found {len(search_results)} similar code chunks")
            return search_results
            
        except Exception as e:
            print(f"❌ [PINECONE] Error searching: {e}", flush=True)
            logger.error(f"❌ Error searching in Pinecone: {e}")
            return []
    
    async def delete_repository_data(self, repository_id: int):
        """Delete all vectors for a repository"""
        try:
            namespace = f"repo_{repository_id}"
            
            self.index.delete(delete_all=True, namespace=namespace)
            
            print(f"🗑️ [PINECONE] Deleted all data for repository {repository_id}", flush=True)
            logger.info(f"🗑️ Deleted all data for repository {repository_id}")
            
        except Exception as e:
            print(f"⚠️ [PINECONE] Error deleting repository data: {e}", flush=True)
            logger.warning(f"⚠️ Error deleting repository data: {e}")