import { NextRequest, NextResponse } from 'next/server';
import { openApiSpec } from '@/lib/openapi';

/**
 * GET /api/docs
 * Returns OpenAPI specification with Swagger UI HTML
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format');
  
  // Return JSON spec if requested
  if (format === 'json') {
    return NextResponse.json(openApiSpec);
  }
  
  // Return Swagger UI HTML
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Restaurant OS - API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin:0; background: #fafafa; }
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info .title { font-size: 2rem; }
    .swagger-ui .info .title small { font-size: 0.7rem; }
    
    /* Custom theme */
    .swagger-ui .info .title { color: #f97316; }
    .swagger-ui .opblock-tag { border-bottom: 1px solid #f97316; }
    .swagger-ui .opblock .opblock-summary-method { 
      background: #f97316; 
    }
    .swagger-ui .opblock.opblock-post .opblock-summary-method { 
      background: #49cc90; 
    }
    .swagger-ui .opblock.opblock-get .opblock-summary-method { 
      background: #61affe; 
    }
    .swagger-ui .opblock.opblock-put .opblock-summary-method { 
      background: #fca130; 
    }
    .swagger-ui .opblock.opblock-delete .opblock-summary-method { 
      background: #f93e3e; 
    }
    
    /* Header */
    .custom-header {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      padding: 20px;
      color: white;
      text-align: center;
    }
    .custom-header h1 {
      margin: 0;
      font-size: 2.5rem;
      font-weight: bold;
    }
    .custom-header p {
      margin: 10px 0 0;
      opacity: 0.9;
    }
    .custom-header .badges {
      margin-top: 15px;
    }
    .custom-header .badge {
      display: inline-block;
      padding: 5px 15px;
      background: rgba(255,255,255,0.2);
      border-radius: 20px;
      margin: 0 5px;
      font-size: 0.9rem;
    }
    
    /* Try it out section */
    .try-it-out {
      background: #f0f9ff;
      border: 1px solid #0ea5e9;
      border-radius: 8px;
      padding: 15px;
      margin: 20px;
    }
  </style>
</head>
<body>
  <div class="custom-header">
    <h1>🍽️ Restaurant OS API</h1>
    <p>Africa-First Restaurant Management System</p>
    <div class="badges">
      <span class="badge">v1.0.0</span>
      <span class="badge">OpenAPI 3.0</span>
      <span class="badge">🇨🇮 Made for Africa</span>
    </div>
  </div>
  
  <div id="swagger-ui"></div>
  
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    // Initialize Swagger UI
    const ui = SwaggerUIBundle({
      url: "/api/docs?format=json",
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIStandalonePreset
      ],
      plugins: [
        SwaggerUIBundle.plugins.DownloadUrl
      ],
      layout: "StandaloneLayout",
      docExpansion: "list",
      defaultModelsExpandDepth: 1,
      defaultModelExpandDepth: 1,
      displayOperationId: false,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
      requestSnippetsEnabled: true,
      persistAuthorization: true,
      syntaxHighlight: {
        activate: true,
        theme: "monokai"
      },
      onComplete: function() {
        // Add custom interactivity
        console.log('Swagger UI loaded successfully');
      }
    });
    
    // Set default authorization if token exists
    const token = localStorage.getItem('api_token');
    if (token) {
      ui.authActions.authorize({
        bearerAuth: {
          name: 'bearerAuth',
          schema: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
          value: token
        }
      });
    }
  </script>
</body>
</html>
  `.trim();

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
