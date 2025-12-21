import http.server
import socketserver
import os
import threading
import sys

# --------------------------
# CONFIGURATION
# --------------------------
PORT = 5173
DIRECTORY = "." # Current directory (platform/app)

class ThreadedHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True

class SPAHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        try:
            # 1. Ignore icon errors to keep logs clean
            if "android-chrome" in self.path or "favicon" in self.path:
                if not os.path.exists(f".{self.path}"):
                    self.send_error(404)
                    return

            # 2. Get the real file path
            # Remove query params (?url=...)
            clean_path = self.path.split('?')[0]
            # Convert URL path to file system path (e.g. /dv/31.json -> ./dv/31.json)
            file_path = f".{clean_path}"

            # 3. DEBUG: Tell us what is happening for the JSON file
            if ".json" in clean_path:
                exists = os.path.exists(file_path)
                print(f"🔎 Checking JSON: {file_path} -> {'✅ FOUND' if exists else '❌ MISSING (Serving HTML instead)'}")

            # 4. If file exists, serve it
            if os.path.exists(file_path) and os.path.isfile(file_path):
                super().do_GET()
                return
            
            # 5. SPA Fallback: If path starts with /dv/ but file is missing, serve index.html
            if self.path.startswith('/dv/'):
                self.path = '/dv/index.html'
                super().do_GET()
                return

            # 6. Default 404
            super().do_GET()

        except Exception as e:
            print(f"❌ Server Error: {e}")

    # Standard logging (Fixed the crash)
    def log_message(self, format, *args):
        sys.stderr.write("%s - - [%s] %s\n" %
                         (self.client_address[0],
                          self.log_date_time_string(),
                          format%args))

print(f"🚀 Server running at http://localhost:{PORT}/dv/")
print(f"📂 Serving from: {os.path.abspath(DIRECTORY)}")

try:
    with ThreadedHTTPServer(("", PORT), SPAHandler) as httpd:
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\n🛑 Server stopped.")