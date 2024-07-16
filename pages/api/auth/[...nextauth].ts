import { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getCsrfToken } from "next-auth/react";
import { SiweMessage } from "siwe";

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
// FIXME: wallet not unlocked can bring a strange case
export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const providers = [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.message || !credentials?.signature) {
            console.log("❌ NextAuth.authorize.error", "Invalid credentials");
            return null;
          }

          const message = JSON.parse(credentials.message);
          const { domain, nonce } = message;
          const { signature } = credentials;

          const siwe = new SiweMessage(message);

          const nextAuthDomains = process.env.NEXTAUTH_DOMAINS?.split(",");
          if (!nextAuthDomains) return null;
          const domainPattern = nextAuthDomains.filter((domain) =>
            domain.includes("*"),
          )[0]; // support 1 domain pattern
          let regexPattern = /.*/; // initialize as any string
          if (domainPattern)
            regexPattern = new RegExp(`^${domainPattern.replace(/\*/g, ".*")}`); // make domain pattern new regex
          if (!nextAuthDomains.includes(domain) && !regexPattern.test(domain)) {
            console.log(
              "❌ NextAuth.authorize.error",
              "Invalid domain",
              domain,
            );
            // FIXME to return meaningful error message
            return null;
          }

          const result = await siwe.verify({ signature, nonce });

          if (result.success) {
            return {
              id: siwe.address,
            };
          }
          return null;
        } catch (e: any) {
          console.log("❌ NextAuth.authorize.error", e);
          return e;
        }
      },
    }),
  ];

  const isDefaultSigninPage =
    req.method === "GET" && req?.query?.nextauth?.includes("signin");

  // Hide Sign-In with Ethereum from default sign page
  if (isDefaultSigninPage) {
    providers.pop();
  }

  return await NextAuth(req, res, {
    // https://next-auth.js.org/configuration/providers/oauth
    providers,
    session: {
      strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      async session({ session, token }: { session: any; token: any }) {
        session.address = token.sub;
        session.user.name = token.sub;
        return session;
      },
    },
  });
}
