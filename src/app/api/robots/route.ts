import { NextResponse } from 'next/server';

export async function GET() {
  const robots = `User-agent: *
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /checkout/
Disallow: /account/

Sitemap: https://tnfashion.vercel.app/sitemap.xml`;

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
