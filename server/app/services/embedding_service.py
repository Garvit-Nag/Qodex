from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        try:
            self.model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("🤖 Local embedding service initialized (all-MiniLM-L6-v2)")
        except Exception as e:
            logger.error(f"❌ Failed to load SentenceTransformer model: {e}")
            raise Exception("Failed to initialize local embedding model")
    
    async def generate_embedding(self, text: str, title: str = "") -> List[float]:
        try:
            content = f"File: {title}\n\nCode:\n{text}" if title else text
            embedding = self.model.encode(content)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"❌ Error generating local embedding: {e}")
            raise
    
    async def generate_embeddings_batch(self, chunks: List[Dict]) -> List[Dict]:
        logger.info(f"🔄 Generating LOCAL embeddings for {len(chunks)} chunks...")
        
        texts = []
        for chunk in chunks:
            content = f"""File: {chunk['file_path']}
Lines: {chunk['start_line']}-{chunk['end_line']}
Type: {chunk['chunk_type']}

Code:
{chunk['content']}"""
            texts.append(content)
        
        try:
            embeddings = self.model.encode(texts, show_progress_bar=True, batch_size=32)
            
            embedded_chunks = []
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                embedded_chunk = {
                    **chunk,
                    'embedding': embedding.tolist(),
                    'content_length': len(chunk['content'])
                }
                embedded_chunks.append(embedded_chunk)
        except Exception as e:
            logger.error(f"❌ Failed to generate batch embeddings: {e}")
            raise
        
        logger.info(f"✅ Generated {len(embedded_chunks)} LOCAL embeddings successfully")
        return embedded_chunks
    
    async def generate_query_embedding(self, query: str) -> List[float]:
        try:
            embedding = self.model.encode(query)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"❌ Error generating query embedding: {e}")
            raise