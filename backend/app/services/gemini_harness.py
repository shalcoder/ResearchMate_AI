import os
import json
import logging
from typing import Dict, Any, Optional, List
import httpx

from app.core.config import settings

logger = logging.getLogger("researchmate.gemini_harness")


class GeminiHarnessAgent:
    """
    Production Gemini 2.5 Harness Agent for ResearchMate AI.
    Directly orchestrates Google's Generative AI endpoint via high-performance HTTPX
    with support for streaming, structured JSON extraction, grounded RAG synthesis,
    and multi-paper comparative reasoning.
    """

    def __init__(self, api_key: Optional[str] = None, model: str = "gemini-2.5-flash"):
        self.api_key = api_key or settings.GEMINI_API_KEY
        self.model = model
        self.base_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent"

    def is_configured(self) -> bool:
        return bool(self.api_key and not self.api_key.startswith("mock-"))

    def generate_content(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 2048,
    ) -> str:
        """
        Execute a synchronous content generation request to Gemini 2.5.
        """
        if not self.is_configured():
            logger.warning("Gemini API key is not configured or is a mock key.")
            return ""

        url = f"{self.base_url}?key={self.api_key}"
        payload: Dict[str, Any] = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
            },
        }

        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        try:
            with httpx.Client(timeout=45.0) as client:
                res = client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"].strip()
                else:
                    logger.error(f"Gemini API returned status {res.status_code}: {res.text}")
        except Exception as e:
            logger.error(f"Exception during Gemini API request: {e}")

        return ""

    async def generate_content_async(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 2048,
    ) -> str:
        """
        Execute an asynchronous content generation request to Gemini 2.5.
        """
        if not self.is_configured():
            return ""

        url = f"{self.base_url}?key={self.api_key}"
        payload: Dict[str, Any] = {
            "contents": [
                {
                    "parts": [{"text": prompt}]
                }
            ],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens,
            },
        }

        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates and "content" in candidates[0]:
                        parts = candidates[0]["content"].get("parts", [])
                        if parts and "text" in parts[0]:
                            return parts[0]["text"].strip()
                else:
                    logger.error(f"Gemini API error ({res.status_code}): {res.text}")
        except Exception as e:
            logger.error(f"Gemini Async Exception: {e}")

        return ""

    def run_grounded_rag_agent(
        self,
        query: str,
        context_excerpts: str,
        chat_history: Optional[List[Dict[str, str]]] = None,
    ) -> str:
        """
        Grounded academic research agent that answers strictly based on evidence
        with embedded numeric bracket citations like [1], [2].
        """
        system_instruction = (
            "You are ResearchMate AI, an elite academic research and peer-review synthesis assistant. "
            "Your objective is to provide comprehensive, rigorously accurate answers based STRICTLY on the "
            "provided retrieved document excerpts. "
            "CRITICAL RULES:\n"
            "1. Whenever stating a claim, quantitative metric, benchmark result, or methodology detail, "
            "you MUST cite the source excerpt using inline bracket notations such as [1], [2], or [1, 2].\n"
            "2. Never hallucinate facts, authors, or figures that do not appear in the excerpts.\n"
            "3. If the excerpts do not contain enough information to address a question, state this clearly."
        )

        history_context = ""
        if chat_history:
            history_lines = [f"{m.get('role', 'user').capitalize()}: {m.get('content', '')}" for m in chat_history[-4:]]
            history_context = "Recent Discussion History:\n" + "\n".join(history_lines) + "\n\n"

        prompt = (
            f"{history_context}"
            f"=== RETRIEVED DOCUMENT EXCERPTS ===\n{context_excerpts}\n\n"
            f"=== RESEARCHER QUESTION ===\n{query}\n\n"
            f"Please synthesize a grounded response with citations:"
        )

        output = self.generate_content(prompt, system_instruction=system_instruction, temperature=0.15)
        return output

    def run_paper_summary_agent(self, paper_title: str, full_text_sample: str) -> Dict[str, Any]:
        """
        Extracts structured academic executive summary, key findings, methodology,
        limitations, and future scope.
        """
        system_instruction = (
            "You are an expert scientific literature reviewer for top venues like NeurIPS, ICML, and CVPR. "
            "Extract structured academic insights from the provided paper text and return VALID JSON ONLY with keys:\n"
            "- executive_summary: A 2-3 sentence high-level synthesis\n"
            "- key_findings: List of 3-5 strings specifying novel discoveries, benchmark scores, or core claims\n"
            "- methodology: 2-3 sentences explaining architectures, algorithms, or experimental design\n"
            "- limitations: List of 2-4 strings describing real constraints or unaddressed challenges\n"
            "- future_scope: List of 2-3 strings pointing to promising extensions\n"
            "Output RAW JSON only without markdown code fences or backticks."
        )

        prompt = f"Paper Title: {paper_title}\n\nExcerpt / Content:\n{full_text_sample[:10000]}\n\nJSON Output:"
        response_text = self.generate_content(prompt, system_instruction=system_instruction, temperature=0.1)

        try:
            # Strip markdown formatting if any
            clean_json = response_text.strip()
            if clean_json.startswith("```json"):
                clean_json = clean_json[7:]
            if clean_json.startswith("```"):
                clean_json = clean_json[3:]
            if clean_json.endswith("```"):
                clean_json = clean_json[:-3]
            return json.loads(clean_json.strip())
        except Exception:
            return {}

    def run_comparative_synthesis_agent(
        self,
        paper1_title: str,
        paper1_summary: str,
        paper2_title: str,
        paper2_summary: str,
    ) -> Dict[str, Any]:
        """
        Cross-analyzes two papers, highlighting architectural trade-offs, methodological
        differences, and research gaps.
        """
        system_instruction = (
            "You are an expert comparative literature analyst. Analyze two research papers "
            "and output JSON with keys:\n"
            "- synthesis: In-depth paragraph synthesizing comparative findings\n"
            "- commonalities: List of strings detailing shared objectives or mechanisms\n"
            "- distinctions: List of strings detailing fundamental differences\n"
            "- research_gaps: List of strings identifying unexplored open problems between the two approaches\n"
            "Output RAW JSON only."
        )

        prompt = (
            f"Paper A: {paper1_title}\nSummary: {paper1_summary}\n\n"
            f"Paper B: {paper2_title}\nSummary: {paper2_summary}\n\n"
            "JSON Comparative Analysis:"
        )

        response_text = self.generate_content(prompt, system_instruction=system_instruction, temperature=0.2)
        try:
            clean_json = response_text.strip()
            if clean_json.startswith("```json"):
                clean_json = clean_json[7:]
            if clean_json.startswith("```"):
                clean_json = clean_json[3:]
            if clean_json.endswith("```"):
                clean_json = clean_json[:-3]
            return json.loads(clean_json.strip())
        except Exception:
            return {}


# Global harness agent instance
gemini_harness = GeminiHarnessAgent()
