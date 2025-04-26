import os
import mimetypes
import glob
from django.http import HttpResponse

def serve_react_file(request):
    """
    Direct file server for React app that handles static files
    """
    # Ensure correct MIME types
    mimetypes.add_type("text/javascript", ".js", True)
    mimetypes.add_type("application/javascript", ".js", True)
    mimetypes.add_type("text/css", ".css", True)

    print(f"[DEBUG] Requested path: {request.path}")

    # Locate build directory (try both frontend/build and backend/frontend_build)
    project_root   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    build_dir      = os.path.join(project_root, 'frontend', 'build')
    alt_build_dir  = os.path.join(project_root, 'backend', 'frontend_build')

    if os.path.exists(alt_build_dir):
        react_build_path = alt_build_dir
        print(f"[INFO] Using alternative build path: {react_build_path}")
    elif os.path.exists(build_dir):
        react_build_path = build_dir
        print(f"[INFO] Using build path: {react_build_path}")
    else:
        print(f"[ERROR] React build directory not found in {build_dir} or {alt_build_dir}")
        return HttpResponse("React build directory not found. Please build the frontend.", status=500)

    # Determine which file to serve
    path = request.path
    if path in ('', '/'):
        full_path = os.path.join(react_build_path, 'index.html')
        print("[DEBUG] Serving index.html for root path")
    else:
        path = path.lstrip('/')
        full_path = os.path.join(react_build_path, path)
        print(f"[DEBUG] Constructed path: {full_path}")

    # Handle static files with multiple lookup strategies
    if 'static' in path:
        print(f"[DEBUG] Static file detected: {path}")
        possible_paths = [
            full_path,
            os.path.join(react_build_path, path.replace('static/', '', 1)) if path.startswith('static/') else None,
            os.path.join(react_build_path, 'static', os.path.basename(path)),
            os.path.join(react_build_path, 'static', 'js', os.path.basename(path))  if path.endswith('.js')  else None,
            os.path.join(react_build_path, 'static', 'css', os.path.basename(path)) if path.endswith('.css') else None,
        ]
        for tp in possible_paths:
            if tp and os.path.exists(tp):
                full_path = tp
                print(f"[DEBUG] Static file found at: {full_path}")
                break

        # Try hashed filenames via glob
        if not os.path.exists(full_path) and (path.endswith('.js') or path.endswith('.css')):
            basename   = os.path.basename(path)
            parts      = basename.split('.')
            if len(parts) > 2:
                prefix, ext = parts[0], parts[-1]
                search_dir   = os.path.join(react_build_path, 'static', ext)
                if os.path.exists(search_dir):
                    pattern = os.path.join(search_dir, f"{prefix}.*.{ext}")
                    matches = glob.glob(pattern)
                    if matches:
                        full_path = matches[0]
                        print(f"[DEBUG] Found matching file via pattern: {full_path}")

        # Log directory listings if still missing
        if not os.path.exists(full_path):
            js_dir  = os.path.join(react_build_path, 'static', 'js')
            css_dir = os.path.join(react_build_path, 'static', 'css')
            if os.path.exists(js_dir):
                print(f"[DEBUG] Available JS files: {os.listdir(js_dir)}")
            if os.path.exists(css_dir):
                print(f"[DEBUG] Available CSS files: {os.listdir(css_dir)}")

    # Fallback to index.html for client‑side routing
    if not os.path.exists(full_path) or os.path.isdir(full_path):
        print(f"[DEBUG] File not found, serving index.html as fallback: {full_path}")
        full_path = os.path.join(react_build_path, 'index.html')

    # Guess content type
    content_type, encoding = mimetypes.guess_type(full_path)
    if full_path.endswith('.js') and not content_type:
        content_type = 'application/javascript'
    elif full_path.endswith('.css') and not content_type:
        content_type = 'text/css'
    print(f"[DEBUG] Content type for {full_path}: {content_type}")

    # Serve the file
    try:
        with open(full_path, 'rb') as f:
            resp = HttpResponse(f.read(), content_type=content_type)
            if encoding:
                resp['Content-Encoding'] = encoding
            if 'static' in path:
                resp['Cache-Control'] = 'public, max-age=31536000'
            return resp
    except Exception as e:
        print(f"[ERROR] Could not read file {full_path}: {e}")
        # Final fallback: index.html
        try:
            index_path = os.path.join(react_build_path, 'index.html')
            print("[DEBUG] Trying to serve index.html as fallback")
            with open(index_path, 'rb') as f:
                return HttpResponse(f.read(), content_type='text/html')
        except Exception as e2:
            print(f"[ERROR] Could not read index.html: {e2}")
            return HttpResponse(f"Error serving React app: {e2}", status=500)
