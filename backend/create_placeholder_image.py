import os
import shutil
import urllib.request

def ensure_placeholder_image():
    """Ensure the car placeholder image exists."""
    static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
    images_dir = os.path.join(static_dir, 'images')
    placeholder_path = os.path.join(images_dir, 'car-placeholder.jpg')
    
    # Create directories if they don't exist
    os.makedirs(images_dir, exist_ok=True)
    
    # If placeholder doesn't exist, create a simple one
    if not os.path.exists(placeholder_path):
        try:
            # Try to download a placeholder image
            print(f"Downloading placeholder image to {placeholder_path}")
            urllib.request.urlretrieve(
                'https://via.placeholder.com/600x400?text=No+Image+Available',
                placeholder_path
            )
            print("Placeholder image created!")
        except Exception as e:
            print(f"Error creating placeholder image: {e}")
            # If download fails, create an empty file
            with open(placeholder_path, 'wb') as f:
                f.write(b'')
            print("Created empty placeholder file")

if __name__ == "__main__":
    ensure_placeholder_image()
