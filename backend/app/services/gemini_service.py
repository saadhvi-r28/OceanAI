import google.generativeai as genai
import asyncio
import time
from typing import List
from app.core.config import settings

# Configure Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)


class GeminiService:
    def __init__(self):
        # Use the latest stable Gemini model
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        self.last_request_time = 0
        self.min_request_interval = 6.5  # Slightly over 6 seconds to stay under 10 requests/minute
    
    async def generate_outline(self, topic: str, document_type: str, num_sections: int = 5) -> List[str]:
        """Generate document outline using Gemini."""
        # Apply rate limiting
        await self._rate_limit()
        
        if document_type == "docx":
            prompt = f"""Generate {num_sections} section headers for a professional document with the title: "{topic}"

Focus on creating sections that directly support and expand on the project title.
Return ONLY the section headers, one per line, without numbering or additional formatting.
Make them clear, specific, and well-structured.

Example format:
Introduction
Background and Context
Key Findings
etc."""
        else:  # pptx
            prompt = f"""Generate {num_sections} slide titles for a professional PowerPoint presentation with the title: "{topic}"

Focus on creating slides that directly support and expand on the presentation title.
Return ONLY the slide titles, one per line, without numbering or additional formatting.
IMPORTANT: Each title must be maximum 5 words - keep them concise and impactful for slide headings.

Example format:
Market Overview
Strategic Analysis
Future Recommendations
etc."""
        
        # Run the synchronous API call in a thread pool
        response = await asyncio.to_thread(self.model.generate_content, prompt)
        # Remove all ** markdown bold formatting and split into sections
        content = response.text.strip().replace('**', '')
        sections = [line.strip() for line in content.split('\n') if line.strip()]
        return sections[:num_sections]
    
    async def _rate_limit(self):
        """Implement rate limiting to avoid API quota errors."""
        current_time = time.time()
        time_since_last_request = current_time - self.last_request_time
        
        if time_since_last_request < self.min_request_interval:
            wait_time = self.min_request_interval - time_since_last_request
            await asyncio.sleep(wait_time)
        
        self.last_request_time = time.time()
    
    async def generate_section_content(
        self, 
        topic: str, 
        section_title: str, 
        document_type: str,
        project_context: str = ""
    ) -> str:
        """Generate content for a specific section."""
        # Apply rate limiting
        await self._rate_limit()
        
        if document_type == "docx":
            prompt = f"""Write detailed, professional content for the following section of a document titled "{topic}":

Section: {section_title}

{f"Document context: {project_context}" if project_context else ""}

Write 2-3 well-structured paragraphs with clear, informative content.
Focus on how this section supports the document title: "{topic}"
Use professional language and ensure the content is comprehensive and relevant.
Do not include the section title in your response."""
        else:  # pptx
            prompt = f"""Create content for the following PowerPoint slide in a presentation titled "{topic}":

Slide Title: {section_title}

{f"Presentation context: {project_context}" if project_context else ""}

Provide:
1. 3-5 concise bullet points
2. Keep each point clear and impactful
3. Focus on how this slide supports the presentation title: "{topic}"
4. Use professional presentation language

Format as bullet points with • symbol.
Do not include the slide title in your response."""
        
        # Run the synchronous API call in a thread pool with retry logic
        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = await asyncio.to_thread(self.model.generate_content, prompt)
                # Remove all ** markdown bold formatting
                content = response.text.strip()
                content = content.replace('**', '')
                return content
            except Exception as e:
                if "ResourceExhausted" in str(type(e)) or "429" in str(e):
                    if attempt < max_retries - 1:
                        wait_time = 20 * (attempt + 1)  # Exponential backoff
                        await asyncio.sleep(wait_time)
                        continue
                raise
    
    async def refine_content(
        self, 
        original_content: str, 
        refinement_prompt: str,
        section_title: str
    ) -> str:
        """Refine existing content based on user prompt."""
        # Apply rate limiting
        await self._rate_limit()
        
        prompt = f"""You are refining content for a section titled "{section_title}".

Current content:
{original_content}

User's refinement request: {refinement_prompt}

Provide the refined content based on the user's request. Maintain professional quality and relevance to the section.
Return ONLY the refined content, without any preamble or explanation."""
        
        # Run the synchronous API call in a thread pool
        response = await asyncio.to_thread(self.model.generate_content, prompt)
        # Remove all ** markdown bold formatting
        content = response.text.strip()
        content = content.replace('**', '')
        return content


gemini_service = GeminiService()
