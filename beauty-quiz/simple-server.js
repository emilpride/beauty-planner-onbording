const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  let filePath = '.' + req.url;
  if (filePath === './') {
    filePath = './index.html';
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const contentType = mimeTypes[extname] || 'application/octet-stream';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // Serve the main quiz page for any route
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Beauty Mirror Quiz</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="min-h-screen flex items-center justify-center px-4">
        <div class="max-w-md mx-auto text-center">
            <div class="bg-white rounded-2xl shadow-2xl p-8">
                <div class="mb-8">
                    <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span class="text-4xl">✨</span>
                    </div>
                    <h1 class="text-3xl font-bold text-gray-900 mb-4">
                        Beauty Mirror
                    </h1>
                    <p class="text-lg text-gray-600 mb-2">
                        Your Personal AI Assistant
                    </p>
                    <p class="text-sm text-gray-500">
                        Find your true beauty through the perfect balance of self-care, mental well-being, and physical health
                    </p>
                </div>

                <button
                    onclick="startQuiz()"
                    class="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200"
                >
                    Let's Go
                </button>

                <p class="text-xs text-gray-500 mt-4">
                    The information provided is for educational purposes only
                </p>
            </div>
        </div>
    </div>

    <script>
        function startQuiz() {
            alert('Quiz functionality will be available when Next.js is properly installed.\\n\\nTo install dependencies:\\n1. Run: npm install\\n2. Run: npm run dev');
        }
    </script>
</body>
</html>
        `);
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + error.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log('🚀 Beauty Mirror Quiz Server running at http://localhost:' + PORT);
  console.log('📝 Note: This is a simple server. For full functionality:');
  console.log('   1. Run: npm install');
  console.log('   2. Run: npm run dev');
});



