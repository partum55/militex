import os
import json
from django.conf import settings
from django.http import HttpResponse


def get_react_app(request):
    """
    Directly serve the React app by reading its files
    """
    try:
        build_path = os.path.join(settings.BASE_DIR, '..', 'frontend', 'build')
        if not os.path.exists(build_path):
            build_path = os.path.join(settings.BASE_DIR, 'frontend_build')

        # Handle static files (CSS, JS)
        if request.path.startswith('/static/'):
            # Extract the file path relative to the static directory
            file_path = request.path.replace('/static/', '')
            abs_file_path = os.path.join(build_path, 'static', file_path)

            if os.path.exists(abs_file_path):
                with open(abs_file_path, 'rb') as f:
                    content = f.read()

                # Set the correct content type
                content_type = 'text/css' if file_path.endswith('.css') else 'application/javascript'
                return HttpResponse(content, content_type=content_type)

        # For all other paths, serve index.html
        index_path = os.path.join(build_path, 'index.html')
        with open(index_path, 'r') as f:
            return HttpResponse(f.read())

    except Exception as e:
        return HttpResponse(f"Error serving React app: {str(e)}", status=500)
