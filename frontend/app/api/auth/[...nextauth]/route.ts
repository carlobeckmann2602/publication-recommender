import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

async function refreshToken(token: JWT): Promise<JWT> {
  /*const res = await fetch(Backend_URL + "/auth/refresh", {
    method: "POST",
    headers: {
      authorization: `Refresh ${token.token.jwtRefreshToken}`,
    },
  });*/

  //const response = await res.json();
  const response = {
    token: {
      jwtToken: "token",
      jwtRefreshToken: "refresh-token",
    },
  };

  return {
    ...token,
    backendTokens: response,
  };
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.username || !credentials?.password) return null;
        const { username, password } = credentials;

        const user = {
          id: "1",
          name: "J Smith",
          email: credentials?.username,
          image: "imageURL",
        };
        // accessing the jwt returned by server
        const token = {
          jwtToken: "parsedResponse.access_token",
          jwtRefreshToken: "refresh-token",
        };

        //TODO! Add GraphQL Api Call for user lookup

        if (user) {
          // Any object returned will be saved in `user` property of the JWT
          return { user, token } as any;
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null;

          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],

  pages: {
    signIn: "/signin",
    signOut: "/signout",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        account.access_token = "GoogleJWTToken";
        account.refresh_token = "GoogleJWTRefreshToken";
        //account.expires_at = 1200000000;
        //TODO! Check if mail exists in Backend if not sign user up
        /*
        const response = await axios.post(
        "http://localhost:9000/v1/auth/userExists",
        { email: profile.email }
        );
        if (response && response.data?.value === true) {        
            return true;
        } else {
          const data = {
            firstName: profile.given_name,
            lastName: profile.family_name,
            email: profile.email,
            profileUrl: profile.picture,
          };
          const response = await axios.post(
            "http://localhost:9000/v1/auth/signup",
            data
          );
          return true;
        }
        */
        return true;
      }
      return true; // Do different verification for other providers that don't have `email_verified`
    },
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        token.token = {
          jwtToken: account.access_token,
          jwtRefreshToken: account.refresh_token,
          //jwtExpiresIn: account.expires_at,
        };
        if (user.name && user.email)
          token.user = {
            id: user.id as unknown as number,
            name: user.name,
            email: user.email,
            image: user.image as string,
          };
      }

      if (user) {
        return { ...token, ...user };
      }

      return token;

      /*
      if (
        token.token.jwtExpiresIn &&
        new Date().getTime() < token.token.jwtExpiresIn
      )
        return token;

      return await refreshToken(token);*/
    },

    async session({ token, session, user }) {
      session.user = token.user;
      session.token = token.token;

      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
