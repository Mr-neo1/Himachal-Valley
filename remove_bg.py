from PIL import Image
import sys

img_path = r'C:\Users\rkrai\.gemini\antigravity\brain\9e9ac4bc-46e7-4feb-b732-591a5c0ba456\3d_honey_bee_1782556252547.png'
out_path = r'e:\Himachal Valley\assets\bee_cursor_3d.png'

try:
    img = Image.open(img_path).convert('RGBA')
    datas = img.getdata()
    
    newData = []
    # threshold for black
    for item in datas:
        # if r, g, b are all less than a threshold, make it transparent
        if item[0] < 30 and item[1] < 30 and item[2] < 30:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    
    # Crop the image to the bounding box of non-transparent pixels
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
        
    img.save(out_path, 'PNG')
    print('Image processed and saved to assets successfully.')
except Exception as e:
    print(f'Error: {e}')
