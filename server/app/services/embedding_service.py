import os
from sentence_transformers import SentenceTransformer
import numpy as np
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        try:
            # Create writable cache directory in /app
            cache_dir = "/app/models_cache"
            os.makedirs(cache_dir, exist_ok=True)
            
            # Set HuggingFace environment variables to use our cache
            os.environ['HUGGINGFACE_HUB_CACHE'] = cache_dir
            os.environ['TRANSFORMERS_CACHE'] = cache_dir
            os.environ['HF_HOME'] = cache_dir
            
            print(f"🔧 [CACHE] Using cache directory: {cache_dir}", flush=True)
            logger.info(f"🔧 Using cache directory: {cache_dir}")
            
            # Load model with explicit cache folder
            self.model = SentenceTransformer(
                'all-MiniLM-L6-v2',
                cache_folder=cache_dir,
                device='cpu'
            )
            
            print("✅ [MODEL] SentenceTransformer loaded successfully!", flush=True)
            logger.info("🤖 Local embedding service initialized (all-MiniLM-L6-v2)")
            
        except Exception as e:
            print(f"❌ [ERROR] Failed to load model: {e}", flush=True)
            logger.error(f"❌ Failed to load SentenceTransformer model: {e}")
            raise Exception(f"Failed to initialize local embedding model: {e}")
    
    async def generate_embedding(self, text: str, title: str = "") -> List[float]:
        try:
            content = f"File: {title}\n\nCode:\n{text}" if title else text
            embedding = self.model.encode(content)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"❌ Error generating local embedding: {e}")
            raise
    
    async def generate_embeddings_batch(self, chunks: List[Dict]) -> List[Dict]:
        print(f"🧠 [EMBED] Generating LOCAL embeddings for {len(chunks)} chunks...", flush=True)
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
            print(f"⚡ [EMBED] Processing {len(texts)} texts with SentenceTransformer...", flush=True)
            embeddings = self.model.encode(texts, show_progress_bar=True, batch_size=32)
            
            embedded_chunks = []
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                embedded_chunk = {
                    **chunk,
                    'embedding': embedding.tolist(),
                    'content_length': len(chunk['content'])
                }
                embedded_chunks.append(embedded_chunk)
                
                # Progress logging
                if (i + 1) % 10 == 0:
                    print(f"✅ [EMBED] Processed {i + 1}/{len(chunks)} embeddings", flush=True)
                    
        except Exception as e:
            print(f"❌ [EMBED] Failed to generate batch embeddings: {e}", flush=True)
            logger.error(f"❌ Failed to generate batch embeddings: {e}")
            raise
        
        print(f"🎉 [EMBED] Generated {len(embedded_chunks)} LOCAL embeddings successfully!", flush=True)
        logger.info(f"✅ Generated {len(embedded_chunks)} LOCAL embeddings successfully")
        return embedded_chunks
    
    async def generate_query_embedding(self, query: str) -> List[float]:
        try:
            embedding = self.model.encode(query)
            return embedding.tolist()
        except Exception as e:
            logger.error(f"❌ Error generating query embedding: {e}")
            raise