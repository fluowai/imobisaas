/**
 * MIDDLEWARE - TENANT RESOLVER
 * Identifica o tenant baseado no domínio/host da requisição
 * Funciona com Vercel Edge Middleware
 */

import { NextRequest, NextResponse } from 'next/server';

const ADMIN_DOMAINS = [
  'app.imobisaas.com',
  'admin.imobisaas.com',
  'localhost:3001', // Dev
];

const BASE_DOMAIN = 'imobisaas.com';

export async function middleware(request: NextRequest) {
  const { hostname, pathname } = request.nextUrl;
  
  console.log(`[Middleware] Host: ${hostname}, Path: ${pathname}`);
  
  // 1. Verificar se é domínio admin
  const isAdmin = ADMIN_DOMAINS.some(domain => hostname.includes(domain));
  
  if (isAdmin) {
    // Redirecionar para app admin
    console.log('[Middleware] Admin domain detected');
    
    // Se estiver tentando acessar a raiz, redirecionar para /admin
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    
    // Adicionar header indicando que é admin
    const response = NextResponse.next();
    response.headers.set('x-tenant-type', 'admin');
    return response;
  }
  
  // 2. Resolver tenant para sites públicos
  let tenantSubdomain: string | null = null;
  let tenantCustomDomain: string | null = null;
  
  // Verificar se é subdomínio do sistema
  if (hostname.endsWith(BASE_DOMAIN) && hostname !== BASE_DOMAIN) {
    tenantSubdomain = hostname.replace(`.${BASE_DOMAIN}`, '');
    console.log(`[Middleware] Subdomain detected: ${tenantSubdomain}`);
  } else if (!hostname.includes('localhost')) {
    // É um domínio customizado
    tenantCustomDomain = hostname;
    console.log(`[Middleware] Custom domain detected: ${tenantCustomDomain}`);
  }
  
  // 3. Buscar informações do tenant
  if (tenantSubdomain || tenantCustomDomain) {
    try {
      // Fazer requisição para API para buscar tenant
      const apiUrl = new URL('/api/tenant/resolve', request.url);
      if (tenantSubdomain) {
        apiUrl.searchParams.set('subdomain', tenantSubdomain);
      } else if (tenantCustomDomain) {
        apiUrl.searchParams.set('domain', tenantCustomDomain);
      }
      
      const tenantResponse = await fetch(apiUrl.toString());
      
      if (tenantResponse.ok) {
        const tenant = await tenantResponse.json();
        
        // Adicionar informações do tenant nos headers
        const response = NextResponse.next();
        response.headers.set('x-tenant-id', tenant.id);
        response.headers.set('x-tenant-name', tenant.name);
        response.headers.set('x-tenant-subdomain', tenant.subdomain || '');
        response.headers.set('x-tenant-type', 'public');
        
        console.log(`[Middleware] Tenant resolved: ${tenant.name} (${tenant.id})`);
        return response;
      } else {
        // Tenant não encontrado
        console.log('[Middleware] Tenant not found');
        return new NextResponse('Site não encontrado', { status: 404 });
      }
    } catch (error) {
      console.error('[Middleware] Error resolving tenant:', error);
      return new NextResponse('Erro ao carregar site', { status: 500 });
    }
  }
  
  // 4. Domínio não reconhecido
  return NextResponse.next();
}

// Configurar quais rotas o middleware deve processar
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
