import google.generativeai as genai
import os
from typing import List, Dict
import logging
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            logger.warning("⚠️ GEMINI_API_KEY not found - chat will use fallback responses")
            self.model = None
            self.gemini_available = False
        else:
            try:
                genai.configure(api_key=api_key)
                self.model = genai.GenerativeModel('gemini-2.0-flash')
                self.gemini_available = True
                logger.info("🤖 Gemini chat service initialized")
            except Exception as e:
                logger.error(f"❌ Failed to initialize Gemini: {e}")
                self.model = None
                self.gemini_available = False
    
    async def generate_response(self, query: str, code_chunks: List[Dict], repository_name: str) -> Dict:
        if not self.gemini_available:
            return self.generate_fallback_response(query, code_chunks, repository_name)
        
        try:
            context = self.prepare_context(code_chunks)
            
            prompt = f"""You are an expert code assistant analyzing the {repository_name} repository.
User Question: {query}
Code Context:
{context}
RESPONSE STRUCTURE:
1. ALWAYS start with:
## Main Answer
[Provide a direct, concise answer to the user's question first]
2. Then adapt the rest based on query type:
FOR CODE EXPLANATION/ARCHITECTURE QUERIES:
## Implementation Overview
### Key Components
### Technical Details
### How It Works
FOR DEBUGGING/ERROR QUERIES:
## Root Cause Analysis
## Affected Code
## Suggested Solution
## Prevention Tips
FOR DOCUMENTATION/README REQUESTS:
## Overview
## Installation
## Usage
## Configuration
[Standard README sections as appropriate]
FOR "HOW TO" QUERIES:
## Step-by-Step Guide
## Code Examples
## Best Practices
FOR FEATURE REQUESTS/SUGGESTIONS:
## Current Implementation
## Proposed Approach
## Implementation Steps
**Important**: These are examples, not rigid templates. Use your judgment to structure the response in the way that best answers the user's specific question. You may combine elements from multiple patterns, create your own sections, or use entirely different headings if more appropriate.
Always end with:
## Additional Notes
[Limitations, missing information, or recommendations if relevant]
UNIVERSAL FORMATTING RULES (MANDATORY):
- NO emojis - use clean text only
- Use **bold** for important file names and concepts
- Use `backticks` for functions, variables, classes, and code snippets
- ALWAYS reference specific files and line numbers: `filename.py` (lines X-Y)
- Use > blockquotes for important insights or warnings
- Use proper markdown hierarchy (##, ###, -, >, etc.)
- Be comprehensive and detailed
- Explain both WHAT the code does and HOW it works
- Professional documentation style
- Focus on explanation rather than just code listing
- Clean, professional markdown formatting (GitHub README style)
CRITICAL: Every code reference MUST include the file path and line numbers from the context provided above.
Your detailed markdown response:"""
            
            response = self.model.generate_content(prompt)
            
            # --- START: BEST FIX ---
            # Clean the response text to remove markdown code block wrappers
            response_text = response.text
            
            if response_text.startswith("```markdown"):
                response_text = response_text[len("```markdown"):]
            elif response_text.startswith("```"):
                response_text = response_text[len("```"):]
                
            if response_text.endswith("```"):
                response_text = response_text[:-len("```")]
                
            response_text = response_text.strip() # Remove any leading/trailing whitespace
            # --- END: BEST FIX ---

            sources = []
            for chunk in code_chunks:
                sources.append({
                    'file_path': chunk['file_path'],
                    'start_line': chunk['start_line'],
                    'end_line': chunk['end_line'],
                    'similarity': round(chunk['similarity'], 3),
                    'preview': chunk['content'][:200] + "..."
                })
            
            return {
                'response': response_text,  # Use the cleaned text
                'sources': sources,
                'context_chunks_used': len(code_chunks),
                'repository_name': repository_name,
                'model_used': 'gemini-2.0-flash',
                'success': True
            }
            
        except Exception as e:
            logger.error(f"❌ Gemini error: {e}")
            if "429" in str(e) or "quota" in str(e).lower():
                return self.generate_quota_response(query, code_chunks, repository_name)
            return self.generate_fallback_response(query, code_chunks, repository_name)
    
    def prepare_context(self, code_chunks: List[Dict]) -> str:
        context_sections = []
        for i, chunk in enumerate(code_chunks, 1):
            context_sections.append(f"""
Code Reference {i}:
File: {chunk['file_path']}
Lines: {chunk['start_line']}-{chunk['end_line']}
Similarity: {chunk['similarity']:.2f}
{chunk['content']}
""")
        return "\n".join(context_sections)
    
    def generate_quota_response(self, query: str, code_chunks: List[Dict], repository_name: str) -> Dict:
        context = self.prepare_context(code_chunks)
        response = f"""🚫 Gemini quota exceeded, but I found {len(code_chunks)} relevant code sections:
{context}
The search found relevant code with similarity scores from {min(c['similarity'] for c in code_chunks):.2f} to {max(c['similarity'] for c in code_chunks):.2f}. Please try again in a few minutes when quota resets."""
        
        return self.create_response_dict(response, code_chunks, repository_name, 'quota_exceeded')
    
    def generate_fallback_response(self, query: str, code_chunks: List[Dict], repository_name: str) -> Dict:
        context = self.prepare_context(code_chunks)
        response = f"""Found {len(code_chunks)} relevant code sections for: "{query}"
{context}
Note: AI analysis requires API configuration. The search results above show the most relevant code."""
        
        return self.create_response_dict(response, code_chunks, repository_name, 'fallback')
    
    def create_response_dict(self, response: str, code_chunks: List[Dict], repository_name: str, model_used: str) -> Dict:
        sources = []
        for chunk in code_chunks:
            sources.append({
                'file_path': chunk['file_path'],
                'start_line': chunk['start_line'],
                'end_line': chunk['end_line'],
                'similarity': round(chunk['similarity'], 3),
                'preview': chunk['content'][:200] + "..."
            })
        
        return {
            'response': response,
            'sources': sources,
            'context_chunks_used': len(code_chunks),
            'repository_name': repository_name,
            'model_used': model_used,
            'success': True
        }