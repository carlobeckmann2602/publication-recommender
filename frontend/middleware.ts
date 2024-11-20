//export { default } from "next-auth/middleware";

// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

const basicAuth = (req: NextRequest) => {
  const auth = req.headers.get("authorization");
  const username = process.env.USER_PROTECT;
  const password = process.env.PASSWORD_PROTECT;

  if (!auth) {
    return new NextResponse("Authorization required", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    });
  }

  const [user, pwd] = Buffer.from(auth.split(" ")[1], "base64")
    .toString()
    .split(":");

  if (user === username && pwd === password) {
    return NextResponse.next();
  }

  return new NextResponse("Unauthorized", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
};

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Pfade definieren, die Basisauthentifizierung benötigen
  const protectedPaths = process.env.PASSWORD_PROTECT ? ["/", "/index"] : [];
  const isProtectedPath = protectedPaths.some((path) =>
    url.pathname.startsWith(path)
  );

  if (isProtectedPath) {
    const basicAuthResponse = basicAuth(req);
    if (basicAuthResponse.status === 401) {
      return basicAuthResponse;
    }
  }

  // NextAuth Middleware für bestimmte Routen anwenden
  const nextAuthPaths = ["/profile/:path*"];
  const isNextAuthPath = nextAuthPaths.some((path) =>
    url.pathname.startsWith(path)
  );

  if (isNextAuthPath) {
    return withAuth();
  }

  return NextResponse.next();
}

export default middleware;
