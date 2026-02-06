import { NextRequest, NextResponse } from 'next/server';

export interface SessionSecurityOptions {
  maxSessionAge?: number; // in milliseconds
  requireActiveSession?: boolean;
  logSecurityEvents?: boolean;
}

const defaultOptions: SessionSecurityOptions = {
  maxSessionAge: 8 * 60 * 60 * 1000, // 8 hours
  requireActiveSession: true,
  logSecurityEvents: true,
};

export function withSessionSecurity(
  handler: (req: NextRequest, ...args: any[]) => Promise<NextResponse>,
  options: SessionSecurityOptions = {}
) {
  const config = { ...defaultOptions, ...options };

  return async (req: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      // Check for session security headers
      const sessionId = req.headers.get('x-session-id');
      const sessionStart = req.headers.get('x-session-start');
      const userAgent = req.headers.get('user-agent');
      const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

      // Log security event if enabled
      if (config.logSecurityEvents) {
        console.log(`[Security] API Request: ${req.method} ${req.url}`, {
          sessionId: sessionId ? 'present' : 'missing',
          userAgent: userAgent?.substring(0, 100),
          clientIP,
          timestamp: new Date().toISOString(),
        });
      }

      // Validate session if required
      if (config.requireActiveSession && sessionStart) {
        const sessionAge = Date.now() - parseInt(sessionStart);
        
        if (sessionAge > config.maxSessionAge!) {
          if (config.logSecurityEvents) {
            console.warn(`[Security] Session expired`, {
              sessionAge: Math.round(sessionAge / 1000 / 60), // minutes
              maxAge: Math.round(config.maxSessionAge! / 1000 / 60), // minutes
              clientIP,
            });
          }
          
          return NextResponse.json(
            { 
              success: false, 
              error: 'Session expired for security reasons',
              code: 'SESSION_EXPIRED'
            },
            { status: 401 }
          );
        }
      }

      // Check for suspicious patterns
      const suspiciousPatterns = [
        /bot|crawler|spider/i,
        /curl|wget|postman/i,
        /script|automated/i,
      ];

      if (userAgent && suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
        if (config.logSecurityEvents) {
          console.warn(`[Security] Suspicious user agent detected`, {
            userAgent,
            clientIP,
            url: req.url,
          });
        }
        
        // Don't block, but log for monitoring
      }

      // Rate limiting check (basic)
      // In a real implementation, you'd use Redis or similar for rate limiting
      
      // Call the original handler
      const response = await handler(req, ...args);

      // Add security headers to response
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('X-XSS-Protection', '1; mode=block');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      // Add session security headers
      if (sessionId) {
        response.headers.set('X-Session-Valid', 'true');
      }

      return response;

    } catch (error) {
      if (config.logSecurityEvents) {
        console.error(`[Security] Handler error:`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          url: req.url,
          method: req.method,
        });
      }

      return NextResponse.json(
        { 
          success: false, 
          error: 'Internal server error',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      );
    }
  };
}

// Utility function to validate session on client side
export function validateClientSession(): boolean {
  if (typeof window === 'undefined') return false;

  const sessionId = sessionStorage.getItem('platform_session_id');
  const sessionStart = sessionStorage.getItem('platform_session_start');

  if (!sessionId || !sessionStart) {
    return false;
  }

  const sessionAge = Date.now() - parseInt(sessionStart);
  const maxAge = 8 * 60 * 60 * 1000; // 8 hours

  return sessionAge <= maxAge;
}

// Utility function to add session headers to requests
export function addSessionHeaders(headers: HeadersInit = {}): HeadersInit {
  if (typeof window === 'undefined') return headers;

  const sessionId = sessionStorage.getItem('platform_session_id');
  const sessionStart = sessionStorage.getItem('platform_session_start');

  return {
    ...headers,
    ...(sessionId && { 'x-session-id': sessionId }),
    ...(sessionStart && { 'x-session-start': sessionStart }),
  };
}