from typing import List, Dict, Any, Optional
from app.services.pdf_extractor import ExtractedPage, detect_section_header


class Chunk:
    def __init__(
        self,
        chunk_index: int,
        section_name: str,
        content: str,
        token_count: int,
        page_number: int,
    ):
        self.chunk_index = chunk_index
        self.section_name = section_name
        self.content = content
        self.token_count = token_count
        self.page_number = page_number

    def to_dict(self) -> Dict[str, Any]:
        return {
            "chunk_index": self.chunk_index,
            "section_name": self.section_name,
            "content": self.content,
            "token_count": self.token_count,
            "page_number": self.page_number,
        }


def chunk_extracted_pages(
    pages: List[ExtractedPage],
    target_chunk_chars: int = 1200,
    overlap_chars: int = 150,
) -> List[Chunk]:
    """
    Chunks extracted pages into overlapping contextual blocks with section tracking.
    Approximates tokens as len(chunk_text.split()).
    """
    chunks: List[Chunk] = []
    chunk_index = 0
    current_section = "Introduction"

    for page in pages:
        lines = page.text.splitlines()
        current_buffer: List[str] = []
        current_len = 0

        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue

            detected_section = detect_section_header(stripped)
            if detected_section:
                # If we hit a new major section and buffer has content, flush previous
                if current_buffer and current_len >= 300:
                    chunk_text = " ".join(current_buffer).strip()
                    if chunk_text:
                        chunks.append(
                            Chunk(
                                chunk_index=chunk_index,
                                section_name=current_section,
                                content=chunk_text,
                                token_count=len(chunk_text.split()),
                                page_number=page.page_number,
                            )
                        )
                        chunk_index += 1
                        # Retain overlap from end of buffer
                        current_buffer = [chunk_text[-overlap_chars:]] if overlap_chars > 0 else []
                        current_len = len(current_buffer[0]) if current_buffer else 0

                current_section = detected_section

            current_buffer.append(stripped)
            current_len += len(stripped) + 1

            if current_len >= target_chunk_chars:
                chunk_text = " ".join(current_buffer).strip()
                if chunk_text:
                    chunks.append(
                        Chunk(
                            chunk_index=chunk_index,
                            section_name=current_section,
                            content=chunk_text,
                            token_count=len(chunk_text.split()),
                            page_number=page.page_number,
                        )
                    )
                    chunk_index += 1
                    # Sliding window overlap
                    overlap_seed = chunk_text[-overlap_chars:] if len(chunk_text) > overlap_chars else ""
                    current_buffer = [overlap_seed] if overlap_seed else []
                    current_len = len(overlap_seed)

        # Flush any remaining text on the page
        if current_buffer:
            chunk_text = " ".join(current_buffer).strip()
            if len(chunk_text) > 40:  # ignore tiny noise
                chunks.append(
                    Chunk(
                        chunk_index=chunk_index,
                        section_name=current_section,
                        content=chunk_text,
                        token_count=len(chunk_text.split()),
                        page_number=page.page_number,
                    )
                )
                chunk_index += 1

    return chunks
