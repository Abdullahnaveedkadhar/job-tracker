import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "./env";

const PUBLIC_PREFIXES = ["/login", "/signup", "/setup", "/auth"];

/** The landing page is public, but only at exactly "/". */
const PUBLIC_EXACT = ["/"];

/**
 * Generated metadata assets (Open Graph card, icons). These must stay reachable
 * without a session or link previews break for anyone not signed in.
 */
const PUBLIC_ASSET_PREFIXES = [
  "/opengraph-image",
  "/twitter-image",
  "/icon",
  "/apple-icon",
  "/favicon",
  "/robots.txt",
  "/sitemap.xml",
];

function isPublicAsset(pathname: string): boolean {
  return PUBLIC_ASSET_PREFIXES.some((p) => pathname.startsWith(p));
}

const PUBLIC_API = ["/api/health/db"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.includes(pathname)) return true;
  if (isPublicAsset(pathname)) return true;
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isSupabaseConfigured()) {
    if (
      pathname === "/" ||
      pathname === "/setup" ||
      pathname.startsWith("/_next") ||
      isPublicAsset(pathname)
    ) {
      return NextResponse.next();
    }
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { error: "Supabase is not configured on the server" },
        { status: 503 }
      );
    }
    return NextResponse.redirect(new URL("/setup", request.url));
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublicPath(pathname) && !PUBLIC_API.includes(pathname)) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const login = new URL("/login", request.url);
    login.searchParams.set("from", pathname);
    return NextResponse.redirect(login);
  }

  if (user && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname === "/setup") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}
