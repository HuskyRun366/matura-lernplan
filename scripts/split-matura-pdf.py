#!/usr/bin/env python3
import json
import re
import sys
from pathlib import Path

from pypdf import PdfReader, PdfWriter


PART_B_RE = re.compile(r"Aufgabe\s+\d+\s*\(\s*Teil\s*B\s*\)", re.IGNORECASE)


def write_range(reader: PdfReader, start: int, end: int, output_path: Path) -> None:
    writer = PdfWriter()
    for page_index in range(start, end):
        writer.add_page(reader.pages[page_index])
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("wb") as handle:
        writer.write(handle)


def find_part_b_start(reader: PdfReader) -> int:
    for index, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        if PART_B_RE.search(text):
            return index
    return -1


def main() -> int:
    if len(sys.argv) != 4:
        print(
            "Usage: split-matura-pdf.py INPUT.pdf TEIL_A_OUTPUT.pdf TEIL_B_OUTPUT.pdf",
            file=sys.stderr,
        )
        return 2

    input_path = Path(sys.argv[1])
    teil_a_path = Path(sys.argv[2])
    teil_b_path = Path(sys.argv[3])

    reader = PdfReader(str(input_path))
    part_b_start = find_part_b_start(reader)

    if part_b_start <= 0:
        print(
            f"Could not find a clear Teil B boundary in {input_path}",
            file=sys.stderr,
        )
        return 1

    write_range(reader, 0, part_b_start, teil_a_path)
    write_range(reader, part_b_start, len(reader.pages), teil_b_path)

    print(
        json.dumps(
            {
                "input": str(input_path),
                "pages": len(reader.pages),
                "teilA": {"from": 1, "to": part_b_start},
                "teilB": {"from": part_b_start + 1, "to": len(reader.pages)},
            },
            ensure_ascii=True,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
