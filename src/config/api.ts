// Central API configuration
export const API_CONFIG = {
  // Base URL from environment variable with fallback
  BASE_URL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:8001/api/v1',
  
  // Extract just the backend URL (without /api/v1)
  BACKEND_URL: ((import.meta as any).env?.VITE_API_URL || 'http://localhost:8001/api/v1').replace('/api/v1', ''),
  
  // For vite proxy configuration
  PROXY_TARGET: ((import.meta as any).env?.VITE_API_URL || 'http://localhost:8001/api/v1').replace('/api/v1', ''),
  
  // Common endpoints
  ENDPOINTS: {
    HEALTH: '/health',
    DOCS: '/docs',
    REDOC: '/redoc',
    OPENAPI: '/openapi.json'
  }
} as const;

// Export individual parts for convenience
export const { BASE_URL, BACKEND_URL, PROXY_TARGET } = API_CONFIG;
