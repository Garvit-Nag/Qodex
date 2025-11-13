import git
import os
import tempfile
import shutil
from typing import List, Dict
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class GitHubService:
    def __init__(self):
        self.supported_extensions = {
            '.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.cpp', '.c', 
            '.cs', '.go', '.rs', '.php', '.rb', '.swift', '.kt', '.scala',
            '.html', '.css', '.scss', '.sass', '.vue', '.svelte', '.dart',
            '.r', '.m', '.mm', '.h', '.hpp', '.cc', '.cxx', '.sql'
        }
        self.ignore_dirs = {
            '.git', 'node_modules', '__pycache__', '.venv', 'venv', 
            'build', 'dist', '.next', '.nuxt', 'coverage', '.pytest_cache',
            'vendor', 'target', 'bin', 'obj', '.gradle', '.idea', '.vscode'
        }
    
    async def clone_repository(self, github_url: str) -> str:
        """Clone repository to temporary directory"""
        temp_dir = tempfile.mkdtemp(prefix="codequery_")
        logger.info(f"🔄 Cloning {github_url} to {temp_dir}")
        
        try:
            repo = git.Repo.clone_from(github_url, temp_dir, depth=1)
            logger.info(f"✅ Successfully cloned repository")
            return temp_dir
        except Exception as e:
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
            raise Exception(f"Failed to clone repository: {str(e)}")
    
    def chunk_code_content(self, content: str, file_path: str, max_chunk_size: int = 1000) -> List[Dict]:
        """Split code into meaningful chunks"""
        chunks = []
        lines = content.split('\n')
        
        if len(content) <= max_chunk_size:
            return [{
                'content': content,
                'file_path': file_path,
                'chunk_index': 0,
                'start_line': 1,
                'end_line': len(lines),
                'chunk_type': 'full_file'
            }]
        
        current_chunk = []
        current_size = 0
        chunk_index = 0
        start_line = 1
        
        for i, line in enumerate(lines, 1):
            current_chunk.append(line)
            current_size += len(line) + 1  # +1 for newline
            
            is_function_start = any(line.strip().startswith(keyword) for keyword in 
                                  ['def ', 'function ', 'class ', 'interface ', 'public class'])
            
            if (current_size >= max_chunk_size) or (is_function_start and len(current_chunk) > 1):
                if len(current_chunk) > 1:  
                    chunks.append({
                        'content': '\n'.join(current_chunk[:-1] if is_function_start else current_chunk),
                        'file_path': file_path,
                        'chunk_index': chunk_index,
                        'start_line': start_line,
                        'end_line': i - (1 if is_function_start else 0),
                        'chunk_type': 'code_block'
                    })
                    chunk_index += 1
                    start_line = i if is_function_start else i + 1
                    current_chunk = [line] if is_function_start else []
                    current_size = len(line) + 1 if is_function_start else 0
        
        # Add remaining chunk
        if current_chunk:
            chunks.append({
                'content': '\n'.join(current_chunk),
                'file_path': file_path,
                'chunk_index': chunk_index,
                'start_line': start_line,
                'end_line': len(lines),
                'chunk_type': 'code_block'
            })
        
        return chunks
    
    async def extract_code_files(self, repo_path: str) -> List[Dict]:
        """Extract and chunk all code files from repository"""
        code_chunks = []
        total_files = 0
        
        logger.info(f"📁 Extracting code files from {repo_path}")
        
        for root, dirs, files in os.walk(repo_path):
            dirs[:] = [d for d in dirs if d not in self.ignore_dirs]
            
            for file in files:
                file_path = Path(root) / file
                
                if file_path.stat().st_size > 1024 * 1024:
                    continue
                    
                if file_path.suffix in self.supported_extensions:
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                            content = f.read()
                        
                        if not content.strip():
                            continue
                            
                        relative_path = str(file_path.relative_to(repo_path))
                        
                        chunks = self.chunk_code_content(content, relative_path)
                        code_chunks.extend(chunks)
                        total_files += 1
                        
                        if total_files % 50 == 0:
                            logger.info(f"📊 Processed {total_files} files, {len(code_chunks)} chunks so far...")
                            
                    except Exception as e:
                        logger.warning(f"⚠️ Error reading file {file_path}: {e}")
                        continue
        
        logger.info(f"✅ Extracted {len(code_chunks)} code chunks from {total_files} files")
        return code_chunks
    
    def cleanup_temp_dir(self, temp_dir: str):
        """Clean up temporary directory"""
        try:
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir)
                logger.info(f"🧹 Cleaned up temporary directory: {temp_dir}")
        except Exception as e:
            logger.warning(f"⚠️ Failed to cleanup {temp_dir}: {e}")