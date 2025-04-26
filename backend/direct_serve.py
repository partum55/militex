import os
import mimetypes
import logging

from django.http import HttpResponse, Http404

# Set MIME types for JS and CSS
mimetypes.add_type("text/javascript", ".js", True)
mimetypes.add_type("application/javascript", ".js", True)
mimetypes.add_type("text/css", ".css", True)


def serve_file(request):
    """Very simple file server for React app"""
    # Print the requested path for debugging
    print(f"[DEBUG] Requested path: {request.path}")

    # Find the React build directory
    frontend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'frontend')
    build_dir = os.path.join(frontend_dir, 'build')

    # If build directory doesn't exist, try alternative location
    if not os.path.exists(build_dir):
        build_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend_build')
        print(f"[DEBUG] Using alternative build dir: {build_dir}")

    # Check if build directory exists
    if not os.path.exists(build_dir):
        print(f"[ERROR] No React build directory found")
        return HttpResponse("React build directory not found. Please make sure the frontend is built.", status=500)

    # Remove leading slash
    path = request.path.lstrip('/')

    # Serve index.html for root path
    if not path:
        path = 'index.html'

    # Construct file path
    file_path = os.path.join(build_dir, path)
    print(f"[DEBUG] Trying to serve: {file_path}")

    # Check if file exists
    if os.path.isfile(file_path):
        # Get content type
        content_type, encoding = mimetypes.guess_type(file_path)
        if not content_type:
            if file_path.endswith('.js'):
                content_type = 'application/javascript'
            elif file_path.endswith('.css'):
                content_type = 'text/css'
            else:
                content_type = 'application/octet-stream'

        # Read and serve file
        try:
            with open(file_path, 'rb') as f:
                content = f.read()
            print(f"[DEBUG] Successfully serving {file_path} as {content_type}")
            return HttpResponse(content, content_type=content_type)
        except Exception as e:
            print(f"[ERROR] Error reading file: {file_path} - {str(e)}")
    else:
        print(f"[DEBUG] File not found: {file_path}")

    # If file doesn't exist, serve index.html (for client-side routing)
    index_path = os.path.join(build_dir, 'index.html')
    try:
        with open(index_path, 'rb') as f:
            content = f.read()
        print(f"[DEBUG] Serving index.html as fallback")
        return HttpResponse(content, content_type='text/html')
    except Exception as e:
        print(f"[ERROR] Error serving index.html - {str(e)}")
        raise Http404("Requested file not found")
