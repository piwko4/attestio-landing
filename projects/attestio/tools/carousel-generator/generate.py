#!/usr/bin/env python3
"""
Attestio LinkedIn Carousel Generator

Parses a carousel markdown file, generates slide images via Ideogram API v3,
and assembles them into a PDF for LinkedIn upload.

Usage:
    python generate.py <markdown_file> [--output ./output/] [--dry-run]
"""

import argparse
import os
import re
import sys
import time
from pathlib import Path

import requests
from PIL import Image
from fpdf import FPDF


def parse_carousel_markdown(filepath: str) -> list[dict]:
    """Parse carousel markdown into a list of slide dicts with title and body."""
    text = Path(filepath).read_text(encoding="utf-8")

    # Extract the CAROUSEL SLIDES section
    match = re.search(r"## CAROUSEL SLIDES\s*\n(.*)", text, re.DOTALL)
    if not match:
        print("Error: Could not find '## CAROUSEL SLIDES' section in markdown.", file=sys.stderr)
        sys.exit(1)

    slides_text = match.group(1)

    # Split by ### Slide N
    slide_blocks = re.split(r"###\s+Slide\s+\d+[^\n]*\n", slides_text)
    slide_blocks = [b.strip() for b in slide_blocks if b.strip()]

    slides = []
    for i, block in enumerate(slide_blocks, 1):
        lines = block.strip().split("\n")
        # Extract bold lines as title parts, rest as body
        title_parts = []
        body_lines = []
        for line in lines:
            stripped = line.strip()
            if not stripped or stripped == "---":
                continue
            # Bold lines (**...**) are title/headline
            bold_match = re.match(r"^\*\*(.+?)\*\*$", stripped)
            if bold_match and len(title_parts) < 2:
                title_parts.append(bold_match.group(1))
            else:
                # Clean markdown formatting for body
                cleaned = stripped.lstrip("*").rstrip("*").strip()
                cleaned = re.sub(r"\*\*(.+?)\*\*", r"\1", cleaned)
                cleaned = re.sub(r"\*(.+?)\*", r"\1", cleaned)
                if cleaned:
                    body_lines.append(cleaned)

        title = " ".join(title_parts) if title_parts else f"Slide {i}"
        body = "\n".join(body_lines[:6])  # Cap body lines for prompt length

        slides.append({"number": i, "title": title, "body": body})

    return slides


def build_prompt(slide: dict, total_slides: int) -> str:
    """Build an Ideogram API prompt for a single slide."""
    # Truncate body for prompt to avoid overly long prompts
    body_text = slide["body"]
    if len(body_text) > 300:
        body_text = body_text[:300] + "..."

    prompt = (
        f"Professional LinkedIn carousel slide, dark navy background (#0a0a0f), "
        f"gold accents (#d4a843), modern minimalist design. "
        f"Slide {slide['number']} of {total_slides}. "
        f"Text reads: '{slide['title']}'. "
    )

    if body_text:
        # Take first few key points for subtext
        subtext_lines = [l.strip() for l in body_text.split("\n") if l.strip()][:4]
        subtext = " | ".join(subtext_lines)
        prompt += f"Subtext: '{subtext}'. "

    prompt += (
        "Bottom watermark: 'attestio.ai'. "
        "Clean corporate style, high contrast, easy to read on mobile, "
        "sharp readable text, structured layout. "
        "--no blurry text, messy layout, cluttered design"
    )

    return prompt


def generate_image(prompt: str, api_key: str) -> bytes:
    """Call Ideogram API v3 to generate a 1080x1080 slide image."""
    resp = requests.post(
        "https://api.ideogram.ai/v3/generate",
        headers={"Api-Key": api_key},
        json={
            "prompt": prompt,
            "aspect_ratio": "1:1",
            "model": "V_3",
            "rendering_speed": "DEFAULT",
        },
        timeout=120,
    )

    if resp.status_code != 200:
        print(f"  API error {resp.status_code}: {resp.text[:200]}", file=sys.stderr)
        sys.exit(1)

    data = resp.json()
    image_url = data["data"][0]["url"]

    img_resp = requests.get(image_url, timeout=60)
    img_resp.raise_for_status()
    return img_resp.content


def create_pdf(image_paths: list[Path], output_path: Path):
    """Combine slide PNGs into a single PDF."""
    if not image_paths:
        return

    # Get dimensions from first image
    first_img = Image.open(image_paths[0])
    w, h = first_img.size

    pdf = FPDF(unit="pt", format=(w, h))
    pdf.set_auto_page_break(False)

    for img_path in image_paths:
        pdf.add_page()
        pdf.image(str(img_path), x=0, y=0, w=w, h=h)

    pdf.output(str(output_path))


def main():
    parser = argparse.ArgumentParser(description="Generate LinkedIn carousel from markdown")
    parser.add_argument("markdown_file", help="Path to carousel markdown file")
    parser.add_argument("--output", "-o", default="./output", help="Output directory (default: ./output)")
    parser.add_argument("--dry-run", action="store_true", help="Print prompts without calling API")
    args = parser.parse_args()

    if not Path(args.markdown_file).exists():
        print(f"Error: File not found: {args.markdown_file}", file=sys.stderr)
        sys.exit(1)

    # Parse slides
    slides = parse_carousel_markdown(args.markdown_file)
    print(f"Parsed {len(slides)} slides from {args.markdown_file}")

    # Build prompts
    prompts = [(s, build_prompt(s, len(slides))) for s in slides]

    if args.dry_run:
        print("\n=== DRY RUN — Prompts Only ===\n")
        for slide, prompt in prompts:
            print(f"--- Slide {slide['number']}: {slide['title']} ---")
            print(prompt)
            print()
        return

    # Check API key
    api_key = os.environ.get("IDEOGRAM_API_KEY")
    if not api_key:
        print("Error: IDEOGRAM_API_KEY environment variable not set.", file=sys.stderr)
        sys.exit(1)

    # Create output directory
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    # Generate images
    image_paths = []
    for slide, prompt in prompts:
        num = slide["number"]
        out_path = output_dir / f"slide-{num:02d}.png"
        print(f"Generating slide {num}/{len(slides)}: {slide['title']}")

        img_data = generate_image(prompt, api_key)

        out_path.write_bytes(img_data)
        print(f"  Saved: {out_path}")
        image_paths.append(out_path)

        # Be nice to the API
        if num < len(slides):
            time.sleep(2)

    # Create PDF
    pdf_path = output_dir / "carousel.pdf"
    create_pdf(image_paths, pdf_path)
    print(f"\nPDF created: {pdf_path}")
    print("Done!")


if __name__ == "__main__":
    main()
