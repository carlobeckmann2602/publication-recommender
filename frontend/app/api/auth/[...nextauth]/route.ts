import { LoginDocument } from "@/graphql/mutation/LoginUser.generated";
import { RefreshTokenDocument } from "@/graphql/mutation/RefreshToken.generated";
import { getClient } from "@/lib/client";
import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

async function refreshToken(token: JWT): Promise<JWT> {
  const { data } = await getClient().mutate({
    mutation: RefreshTokenDocument,
    variables: {
      token: token.userToken.jwtRefreshToken,
    },
  });

  const result = {
    jwtToken: data?.refreshToken.accessToken
      ? data.refreshToken.accessToken
      : "",
    jwtRefreshToken: data?.refreshToken.refreshToken
      ? data.refreshToken.refreshToken
      : "",
    jwtExpiresIn: data?.refreshToken.expiresIn
      ? data.refreshToken.expiresIn
      : 0,
  };

  return {
    ...token,
    userToken: result,
  };
}

const authOptions: NextAuthOptions = {
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

        const { data } = await getClient().mutate({
          mutation: LoginDocument,
          variables: {
            email: credentials.username,
            password: credentials.password,
          },
        });

        if (!data) return null;

        const user = {
          id: data?.login.user.id,
          name: data?.login.user.name,
          email: data?.login.user.email,
          image: null,
        };
        // accessing the jwt returned by server
        const userToken = {
          jwtToken: data?.login.jwt.accessToken,
          jwtRefreshToken: data?.login.jwt.refreshToken,
          jwtExpiresIn: new Date().getTime() + data?.login.jwt.expiresIn, //TODO use correct expiry date
        };

        if (user) {
          // Any object returned will be saved in `user` property of the JWT
          return { user, userToken } as any;
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
    signIn: "/login",
    signOut: "/",
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
    async jwt({ token, user, account, trigger, session }) {
      if (account?.provider === "google") {
        token.userToken = {
          jwtToken: account.access_token ? account.access_token : "",
          jwtRefreshToken: account.refresh_token ? account.refresh_token : "",
          jwtExpiresIn: account.expires_at ? account.expires_at : 0,
        };
        if (user.name && user.email)
          token.user = {
            id: user.id as unknown as number,
            name: user.name,
            email: user.email,
            image: user.image as string,
          };
      }

      if (trigger === "update" && session?.user.name && session?.user.name) {
        token.user.name = session.user.name;
        token.user.email = session.user.email;
      }

      if (user) {
        return { ...token, ...user };
      }

      if (new Date().getTime() < token.userToken.jwtExpiresIn) return token;

      return await refreshToken(token);
    },

    async session({ token, session }) {
      session.user = token.user;
      session.userToken = token.userToken;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
