from typing import List, Dict, Optional
import logging
from .pinecone_service import PineconeService

logger = logging.getLogger(__name__)

class VectorService:
    """Vector service that uses Pinecone for production-ready vector storage"""
    
    def __init__(self):
        try:
            print("🚀 [VECTOR] Initializing production vector service with Pinecone", flush=True)
            self.pinecone_service = PineconeService()
            print("✅ [VECTOR] Vector service initialized successfully!", flush=True)
            logger.info("🗄️ Vector service initialized with Pinecone")
            
        except Exception as e:
            print(f"❌ [VECTOR] Failed to initialize vector service: {e}", flush=True)
            logger.error(f"❌ Failed to initialize vector service: {e}")
            raise Exception(f"Failed to initialize vector service: {e}")
    
    async def store_embeddings(self, repository_id: int, embedded_chunks: List[Dict]):
        """Store embeddings using Pinecone"""
        return await self.pinecone_service.store_embeddings(repository_id, embedded_chunks)
    
    async def search_similar_code(self, repository_id: int, query_embedding: List[float], top_k: int = 5, query_text: str = "") -> List[Dict]:
        """Search for similar code using Pinecone - returns identifiers only"""
        
        # Get results from Pinecone (now returns identifiers only, no content)
        results = await self.pinecone_service.search_similar_code(repository_id, query_embedding, top_k)
        
        # Note: Keyword boosting now happens at the PostgreSQL level when fetching content
        # Pinecone handles semantic similarity, PostgreSQL provides full content
        
        return results
    
    async def delete_repository_data(self, repository_id: int):
        """Delete repository data using Pinecone"""
        return await self.pinecone_service.delete_repository_data(repository_id)