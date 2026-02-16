# Attestio LinkedIn Carousel Generator

Generates branded LinkedIn carousel slides from markdown files using the Ideogram API v3.

## Setup

```bash
pip install -r requirements.txt
export IDEOGRAM_API_KEY=your_key_here
```

## Usage

```bash
# Preview prompts without calling the API
python generate.py path/to/carousel.md --dry-run

# Generate carousel images + PDF
python generate.py path/to/carousel.md --output ./output/

# Example with the CMMC myths carousel
python generate.py ../../marketing/linkedin-post-2-carousel.md -o ./output/
```

## Output

- `slide-01.png` through `slide-NN.png` — individual 1080×1080 slide images
- `carousel.pdf` — all slides combined, ready for LinkedIn upload

## Markdown Format

The tool expects a markdown file with a `## CAROUSEL SLIDES` section containing slides marked with `### Slide N` headers. Bold lines (`**text**`) become slide titles; other text becomes body/subtext.

## Branding

- Dark background (#0a0a0f)
- Gold accents (#d4a843)
- "attestio.ai" watermark on each slide
- Clean, modern, professional style
