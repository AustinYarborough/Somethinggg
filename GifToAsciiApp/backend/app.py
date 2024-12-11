from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from PIL import Image, ImageEnhance
import numpy as np
import io
import imageio
import './App.css';

app = Flask(__name__)
CORS(app)

ASCII_CHARS = '@%#*+=-:. '

def resize_image(image, new_width):
    width, height = image.size
    aspect_ratio = height / width
    new_height = int(aspect_ratio * new_width * 0.5)
    return image.resize((new_width, new_height))

def adjust_image(image, contrast, saturation, hue):
    # Adjust contrast
    enhancer = ImageEnhance.Contrast(image)
    image = enhancer.enhance(contrast)
    
    # Adjust saturation
    enhancer = ImageEnhance.Color(image)
    image = enhancer.enhance(saturation)
    
    # Convert to HSV to adjust hue
    img_array = np.array(image)
    img_hsv = Image.fromarray(img_array, 'RGB').convert('HSV')
    h, s, v = img_hsv.split()
    h = h.point(lambda x: (x + int(hue * 255)) % 255)
    img_hsv = Image.merge('HSV', (h, s, v))
    return img_hsv.convert('RGB')

def pixels_to_ascii(image):
    pixels = image.getdata()
    ascii_str = ''
    for pixel in pixels:
        brightness = sum(pixel) / 3
        ascii_str += ASCII_CHARS[int(brightness / 255 * (len(ASCII_CHARS) - 1))]
    return ascii_str

@app.route('/convert', methods=['POST'])
def convert_gif():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    width = int(request.form.get('width', 100))
    contrast = float(request.form.get('contrast', 1.0))
    saturation = float(request.form.get('saturation', 1.0))
    hue = float(request.form.get('hue', 0.0))
    font_size = int(request.form.get('fontSize', 12))

    # Read GIF frames
    gif = imageio.mimread(file)
    ascii_frames = []

    for frame in gif:
        # Convert frame to PIL Image
        img = Image.fromarray(frame)
        
        # Process image
        img = resize_image(img, width)
        img = adjust_image(img, contrast, saturation, hue)
        img = img.convert('L')
        
        # Convert to ASCII
        ascii_str = pixels_to_ascii(img)
        ascii_frames.append(ascii_str)

    return jsonify({
        'frames': ascii_frames,
        'width': width,
        'fontSize': font_size
    })

if __name__ == '__main__':
    app.run(debug=True) 