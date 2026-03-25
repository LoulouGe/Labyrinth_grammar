import sys
from rembg import remove
from PIL import Image

def process(input_path, output_path):
    print(f"Removing background from {input_path}...")
    input_image = Image.open(input_path)
    output_image = remove(input_image)
    output_image.save(output_path)
    print(f"Saved transparent image to {output_path}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python run_bg_ai.py <input> <output>")
        sys.exit(1)
    process(sys.argv[1], sys.argv[2])
