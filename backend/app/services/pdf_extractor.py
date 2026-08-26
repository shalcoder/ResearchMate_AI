import os
import re
from typing import Dict, List, Any, Optional

try:
    import fitz  # PyMuPDF
    HAS_PYMUPDF = True
except ImportError:
    HAS_PYMUPDF = False


KNOWN_SECTIONS = [
    "abstract",
    "introduction",
    "background",
    "related work",
    "methodology",
    "methods",
    "system architecture",
    "proposed method",
    "experiments",
    "experimental setup",
    "results",
    "discussion",
    "conclusion",
    "future work",
    "references",
]


class ExtractedPage:
    def __init__(self, page_number: int, text: str):
        self.page_number = page_number
        self.text = text


class ExtractedPaperData:
    def __init__(
        self,
        title: str,
        abstract: str,
        authors: List[str],
        pages: List[ExtractedPage],
        total_pages: int,
    ):
        self.title = title
        self.abstract = abstract
        self.authors = authors
        self.pages = pages
        self.total_pages = total_pages


def detect_section_header(line: str) -> Optional[str]:
    """Detects if a line looks like an academic section header."""
    clean = line.strip().lower()
    # Remove leading numbering like "1.", "1.1", "IV."
    clean = re.sub(r"^(\d+(\.\d+)*|[ivxlcdm]+\.)\s*", "", clean)
    clean = clean.strip(" :.-_")
    for section in KNOWN_SECTIONS:
        if clean == section or clean.startswith(section + " "):
            return section.title()
    return None


def extract_pdf_data(file_bytes: bytes, filename: str = "document.pdf") -> ExtractedPaperData:
    """
    Extracts text, metadata, abstract, and page content from PDF bytes.
    Uses PyMuPDF if available, or regex-based text extraction fallback.
    """
    pages: List[ExtractedPage] = []
    title = os.path.splitext(filename)[0].replace("_", " ").replace("-", " ").title()
    abstract = ""
    authors: List[str] = []

    if HAS_PYMUPDF:
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            meta = doc.metadata or {}
            if meta.get("title") and len(meta["title"].strip()) > 3:
                title = meta["title"].strip()
            if meta.get("author"):
                authors = [a.strip() for a in meta["author"].split(";") if a.strip()]

            for i, page in enumerate(doc):
                text = page.get_text("text") or ""
                pages.append(ExtractedPage(page_number=i + 1, text=text))
            doc.close()
        except Exception:
            # Fallback to text parsing if PDF stream is corrupt/raw
            text_str = file_bytes.decode("utf-8", errors="ignore")
            pages.append(ExtractedPage(page_number=1, text=text_str))
    else:
        text_str = file_bytes.decode("utf-8", errors="ignore")
        # Split on form-feed character if present
        raw_pages = text_str.split("\x0c") if "\x0c" in text_str else [text_str]
        for i, p in enumerate(raw_pages):
            pages.append(ExtractedPage(page_number=i + 1, text=p))

    # Infer abstract from first page if not found
    if pages:
        first_page_text = pages[0].text
        abstract_match = re.search(
            r"abstract[:\s\n]+(.*?)(?=\n\s*(?:1\.?|I\.?|Introduction|\Z))",
            first_page_text,
            re.IGNORECASE | re.DOTALL,
        )
        if abstract_match:
            abstract = abstract_match.group(1).strip()
        else:
            # First 500 chars as fallback abstract if reasonable
            lines = [l.strip() for l in first_page_text.splitlines() if l.strip()]
            if lines:
                if len(lines) > 1 and len(lines[0]) < 120 and title == os.path.splitext(filename)[0].replace("_", " ").title():
                    title = lines[0]
                abstract = " ".join(lines[1:6])[:600]

    return ExtractedPaperData(
        title=title,
        abstract=abstract,
        authors=authors if authors else ["Author N/A"],
        pages=pages,
        total_pages=max(len(pages), 1),
    )
