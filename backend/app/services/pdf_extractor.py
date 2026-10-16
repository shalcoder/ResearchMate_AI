import os
import re
import io
from typing import Dict, List, Any, Optional

try:
    import fitz  # PyMuPDF
    HAS_PYMUPDF = True
except ImportError:
    try:
        import pymupdf as fitz
        HAS_PYMUPDF = True
    except ImportError:
        HAS_PYMUPDF = False

try:
    import pypdf
    HAS_PYPDF = True
except ImportError:
    HAS_PYPDF = False


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
    clean = re.sub(r"^(\d+(\.\d+)*|[ivxlcdm]+\.)\s*", "", clean)
    clean = clean.strip(" :.-_")
    for section in KNOWN_SECTIONS:
        if clean == section or clean.startswith(section + " "):
            return section.title()
    return None


def extract_pdf_data(file_bytes: bytes, filename: str = "document.pdf") -> ExtractedPaperData:
    """
    Dynamically extracts text, metadata, authors, and structured abstract from real academic PDFs.
    Uses PyMuPDF (fitz) or pypdf to ensure actual document content is extracted rather than raw byte streams.
    """
    pages: List[ExtractedPage] = []
    meta_title = ""
    meta_author = ""
    text_blocks: List[str] = []

    # Check if the file is a binary PDF (starts with or contains %PDF within the first 1KB)
    is_pdf = b"%PDF" in file_bytes[:1024]

    if is_pdf:
        # 1. Primary Extraction: PyMuPDF
        if HAS_PYMUPDF:
            try:
                doc = fitz.open(stream=file_bytes, filetype="pdf")
                meta = doc.metadata or {}
                meta_title = (meta.get("title") or "").strip()
                meta_author = (meta.get("author") or "").strip()

                for i, page in enumerate(doc):
                    t = page.get_text("text") or ""
                    pages.append(ExtractedPage(page_number=i + 1, text=t))

                if len(doc) > 0:
                    blocks = doc[0].get_text("blocks")
                    text_blocks = [b[4].strip() for b in blocks if b[6] == 0 and b[4].strip()]
                doc.close()
            except Exception:
                pass

        # 2. Secondary Extraction: pypdf (Fallback)
        if not pages and HAS_PYPDF:
            try:
                reader = pypdf.PdfReader(io.BytesIO(file_bytes))
                meta = reader.metadata or {}
                meta_title = (meta.get("/Title") or "").strip()
                meta_author = (meta.get("/Author") or "").strip()
                for i, p in enumerate(reader.pages):
                    pages.append(ExtractedPage(page_number=i + 1, text=p.extract_text() or ""))
                if pages:
                    text_blocks = [b.strip() for b in pages[0].text.split("\n\n") if b.strip()]
            except Exception:
                pass
    else:
        # Plain text payload (e.g. unit tests or .txt research notes)
        text_str = file_bytes.decode("utf-8", errors="ignore")
        raw_pages = text_str.split("\x0c") if "\x0c" in text_str else [text_str]
        for i, p in enumerate(raw_pages):
            pages.append(ExtractedPage(page_number=i + 1, text=p))
        if pages:
            text_blocks = [b.strip() for b in pages[0].text.split("\n\n") if b.strip()]

    # If neither extractor could read pages, avoid decoding binary raw streams
    if not pages:
        pages.append(ExtractedPage(page_number=1, text="No readable text found in document."))

    # 3. Dynamic Title Extraction
    title = ""
    generic_words = ["ieee", "access", "untitled", "microsoft word", "arxiv", "springer", "elsevier", "conference", "journal"]
    if meta_title and len(meta_title) > 6 and not any(meta_title.lower() == g for g in generic_words):
        title = meta_title
    else:
        ignore_meta = ["received", "accepted", "date of publication", "digital object identifier", "doi", "volume", "issue", "copyright", "http", "issn"]
        for b in text_blocks[:6]:
            lines = [l.strip() for l in b.splitlines() if l.strip()]
            joined = " ".join(lines)
            if len(joined) > 15 and not any(joined.lower().startswith(im) for im in ignore_meta):
                if not any(im in joined.lower()[:30] for im in ["doi", "received"]):
                    title = joined
                    break
        if not title:
            base = filename.rsplit(".", 1)[0]
            title = re.sub(r"[-_]", " ", base).title()

    title = re.sub(r"\s+", " ", title).strip()

    # 4. Dynamic Abstract Extraction
    abstract = ""
    p0_text = pages[0].text if pages else ""
    m_abs = re.search(
        r"\babstract\b[\s\n:]*([\s\S]*?)(?=\b(index\s*terms|keywords?|key\s*words|introduction|\n\s*(?:[1I]\.|\b1\b\s+introduction))\b|\Z)",
        p0_text,
        re.I,
    )
    if m_abs:
        abstract = re.sub(r"\s+", " ", m_abs.group(1)).strip()
    else:
        paras = [p.strip() for p in p0_text.split("\n\n") if len(p.strip()) > 100]
        for p in paras:
            if not any(h in p.lower() for h in ["department", "university", "ieee", "received"]):
                abstract = re.sub(r"\s+", " ", p).strip()
                break

    # 5. Dynamic Authors Extraction (without hardcoding)
    authors: List[str] = []
    if meta_author and len(meta_author) > 2 and not any(meta_author.lower() == g for g in generic_words):
        raw_list = re.split(r"[,;]|\band\b", meta_author)
        authors = [a.strip().title() for a in raw_list if 2 <= len(a.strip().split()) <= 4]

    if not authors and p0_text:
        title_snippet = title[:25].lower()
        title_pos = p0_text.lower().find(title_snippet)
        abs_pos = re.search(r"\babstract\b", p0_text, re.I)
        end_pos = abs_pos.start() if abs_pos else min(len(p0_text), 1500)
        start_pos = (title_pos + len(title_snippet)) if title_pos != -1 else 0

        header_zone = p0_text[start_pos:end_pos]
        for line in header_zone.splitlines():
            line_clean = line.strip()
            if not line_clean or len(line_clean) < 3:
                continue
            if any(kw in line_clean.lower() for kw in [
                "department", "dept", "university", "college", "laboratory", "school",
                "institute", "email", "ieee", "@", "grant", "fellow", "china", "india",
                "usa", "state", "key", "national", "access"
            ]):
                continue
            clean_names = re.sub(r"[\d*†‡,;]", " ", line_clean)
            tokens = [t.strip().title() for t in re.split(r"\s+and\s+|\s{2,}", clean_names) if t.strip()]
            for tok in tokens:
                words = tok.split()
                if 2 <= len(words) <= 4 and re.match(r"^[A-Za-z\s.\-]+$", tok):
                    if tok not in authors and tok.lower() not in title.lower():
                        authors.append(tok)

    return ExtractedPaperData(
        title=title,
        abstract=abstract[:1500] if abstract else "Abstract could not be automatically indexed from the document text.",
        authors=authors[:6] if authors else ["Academic Research Author"],
        pages=pages,
        total_pages=len(pages),
    )
