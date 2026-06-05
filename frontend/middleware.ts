import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // 1. Cek apakah URL yang diketik berawalan /admin
    if (request.nextUrl.pathname.startsWith('/admin')) {

        // 2. Cek apakah orang tersebut punya Token JWT di Cookies-nya
        const token = request.cookies.get('apomacy_token')?.value;

        // 3. Kalau token tidak ada, langsung TENDANG kembali ke /login
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // Catatan: Pengecekan role (apakah dia admin/customer) 
        // juga bisa dilakukan di sini nanti!
    }

    // Kalau aman, silakan lewat
    return NextResponse.next();
}

// Tentukan URL mana saja yang dijaga oleh satpam ini
export const config = {
    matcher: ['/admin/:path*'],
};