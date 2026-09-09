import re
from typing import List, Dict, Any, Optional


def parse_authors_for_citation(authors: List[str]) -> List[Dict[str, str]]:
    """Splits full author names into first and last name components."""
    parsed = []
    for a in authors:
        cleaned = a.strip()
        parts = cleaned.split()
        if len(parts) == 1:
            parsed.append({"last": parts[0], "first": "", "initials": parts[0][0] + "."})
        else:
            last = parts[-1]
            first = " ".join(parts[:-1])
            initials = " ".join([p[0] + "." for p in parts[:-1] if p])
            parsed.append({"last": last, "first": first, "initials": initials})
    return parsed


class CitationService:
    def format_all(
        self,
        title: str,
        authors: List[str],
        year: Optional[int] = None,
        venue: Optional[str] = None,
        doi: Optional[str] = None,
    ) -> Dict[str, str]:
        yr_str = str(year) if year else "n.d."
        venue_str = venue if venue else "Proceedings of Machine Learning Research"
        doi_str = f"https://doi.org/{doi}" if doi else ""

        parsed = parse_authors_for_citation(authors if authors else ["Author, N."])

        # 1. APA 7th Edition
        # Format: Last, F. M., & Last, F. M. (Year). Title. Venue. DOI
        if len(parsed) == 1:
            apa_authors = f"{parsed[0]['last']}, {parsed[0]['initials']}"
        elif len(parsed) == 2:
            apa_authors = f"{parsed[0]['last']}, {parsed[0]['initials']}, & {parsed[1]['last']}, {parsed[1]['initials']}"
        else:
            apa_authors = f"{parsed[0]['last']}, {parsed[0]['initials']}, et al."

        apa = f"{apa_authors} ({yr_str}). {title}. {venue_str}."
        if doi_str:
            apa += f" {doi_str}"

        # 2. MLA 9th Edition
        # Format: Last, First, and First Last. "Title." Venue, Year.
        if len(parsed) == 1:
            mla_authors = f"{parsed[0]['last']}, {parsed[0]['first'] or parsed[0]['last']}."
        elif len(parsed) == 2:
            mla_authors = f"{parsed[0]['last']}, {parsed[0]['first']} and {parsed[1]['first']} {parsed[1]['last']}."
        else:
            mla_authors = f"{parsed[0]['last']}, {parsed[0]['first']}, et al."

        mla = f'{mla_authors} "{title}." {venue_str}, {yr_str}.'
        if doi:
            mla += f" DOI: {doi}."

        # 3. IEEE Style
        # Format: F. M. Last and F. M. Last, "Title," Venue, Year.
        if len(parsed) == 1:
            ieee_authors = f"{parsed[0]['initials']} {parsed[0]['last']}"
        elif len(parsed) == 2:
            ieee_authors = f"{parsed[0]['initials']} {parsed[0]['last']} and {parsed[1]['initials']} {parsed[1]['last']}"
        else:
            ieee_authors = f"{parsed[0]['initials']} {parsed[0]['last']} et al."

        ieee = f'{ieee_authors}, "{title}," in {venue_str}, {yr_str}.'
        if doi:
            ieee += f" doi: {doi}."

        # 4. Harvard Style
        # Format: Last, F. and Last, F., Year. Title. Venue.
        if len(parsed) == 1:
            harv_authors = f"{parsed[0]['last']}, {parsed[0]['initials']}"
        elif len(parsed) == 2:
            harv_authors = f"{parsed[0]['last']}, {parsed[0]['initials']} and {parsed[1]['last']}, {parsed[1]['initials']}"
        else:
            harv_authors = f"{parsed[0]['last']}, {parsed[0]['initials']} et al."

        harvard = f"{harv_authors}, {yr_str}. {title}. {venue_str}."

        # 5. Chicago Style (Notes & Bibliography)
        if len(parsed) == 1:
            chic_authors = f"{parsed[0]['last']}, {parsed[0]['first'] or parsed[0]['last']}."
        elif len(parsed) == 2:
            chic_authors = f"{parsed[0]['last']}, {parsed[0]['first']}, and {parsed[1]['first']} {parsed[1]['last']}."
        else:
            chic_authors = f"{parsed[0]['last']}, {parsed[0]['first']}, et al."

        chicago = f'{chic_authors} "{title}." {venue_str} ({yr_str}).'

        # 6. BibTeX format
        first_author_key = re.sub(r"[^a-zA-Z]", "", parsed[0]["last"]).lower() if parsed else "author"
        cite_key = f"{first_author_key}{yr_str if yr_str.isdigit() else '2024'}{re.sub(r'[^a-zA-Z]', '', title.split()[0]).lower()}"
        bibtex_authors = " and ".join([f"{p['last']}, {p['first']}" if p['first'] else p['last'] for p in parsed])

        bibtex = (
            f"@article{{{cite_key},\n"
            f"  author = {{{bibtex_authors}}},\n"
            f"  title = {{{title}}},\n"
            f"  journal = {{{venue_str}}},\n"
            f"  year = {{{yr_str}}}"
        )
        if doi:
            bibtex += f",\n  doi = {{{doi}}}"
        bibtex += "\n}"

        return {
            "apa": apa,
            "mla": mla,
            "ieee": ieee,
            "harvard": harvard,
            "chicago": chicago,
            "bibtex": bibtex,
        }


citation_service = CitationService()
