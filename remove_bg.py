from PIL import Image
import sys

def remove_bg(filename):
    try:
        img = Image.open(filename).convert("RGBA")
        data = img.getdata()
        
        # Use top left pixel as bg
        bg_color = data[0]
        tolerance = 60
        
        new_data = []
        for item in data:
            if abs(item[0] - bg_color[0]) < tolerance and \
               abs(item[1] - bg_color[1]) < tolerance and \
               abs(item[2] - bg_color[2]) < tolerance:
                # Transparent pixel
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)
                
        img.putdata(new_data)
        img.save(filename, "PNG")
        print(f"Processed {filename}")
    except Exception as e:
        print(f"Error processing {filename}: {e}")

remove_bg("public/poule.png")
remove_bg("public/minotaure.png")
