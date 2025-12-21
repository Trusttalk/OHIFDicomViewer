import http.server
import socketserver
import os
import sys

# --------------------------
# CONFIGURATION
# --------------------------
PORT = 3000
DIRECTORY = "." # Current directory

class ThreadedHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    daemon_threads = True
    allow_reuse_address = True

class SPAHandler(http.server.SimpleHTTPRequestHandler):

    # [CRITICAL FIX] Enable CORS so Port 5173 can talk to Port 3000
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

    # Handle Preflight requests
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        try:
            # 1. Ignore icon noise
            if "android-chrome" in self.path or "favicon" in self.path:
                if not os.path.exists(f".{self.path}"):
                    self.send_error(404)
                    return

            # 2. Prepare paths
            # Remove query strings for file system check
            clean_path = self.path.split('?')[0]
            # Convert URL path to relative file path (e.g. /dv/31.json -> ./dv/31.json)
            # We strip the leading '/' so os.path.join works correctly if needed, or just append to '.'
            if clean_path.startswith('/'):
                file_path = f".{clean_path}"
            else:
                file_path = clean_path

            # 3. DEBUG: Check JSON existence
            if ".json" in clean_path:
                exists = os.path.exists(file_path)
                status = "✅ FOUND" if exists else "❌ MISSING"
                print(f"🔎 Request: {clean_path} | Local Path: {file_path} -> {status}")

            # 4. If file exists, serve it directly
            if os.path.exists(file_path) and os.path.isfile(file_path):
                super().do_GET()
                return

            # 5. SPA Fallback: If it's a route (starts with /dv/) but not a file, serve index.html
            # But DO NOT serve index.html for missing .json files (let them 404)
            if self.path.startswith('/dv/') and ".json" not in self.path:
                print(f"🔄 SPA Fallback: Serving index.html for {self.path}")
                self.path = '/dv/index.html'
                super().do_GET()
                return

            # 6. Default behavior (404)
            super().do_GET()

        except Exception as e:
            # Catch "Connection Aborted" errors silently to stop terminal spam
            if "10053" not in str(e) and "Broken pipe" not in str(e):
                print(f"❌ Server Error: {e}")

    # Standard logging
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
