from PIL import Image
import sys

def remove_bg(filename):
    try:
        img = Image.open(filename).convert("RGBA")
        data = img.getdata()
        # White background from Gemini Image has slight shadows. Let's use high tolerance for near-white.
        tolerance = 25
        new_data = []
        for item in data:
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)
        img.putdata(new_data)
        img.save(filename, "PNG")
        print(f"Processed {filename}")
    except Exception as e:
        print(f"Error processing {filename}: {e}")

remove_bg("public/chicken_fist.png")
remove_bg("public/minotaur_fist.png")
remove_bg("public/poule.png")
