import { NextAuthOptions } from "next-auth";
import CredentialsProviderImport from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

const CredentialsProvider = (CredentialsProviderImport as any)?.default ?? (CredentialsProviderImport as any);

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username or Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                console.log("Authorize called with:", credentials);
                if (!credentials?.username || !credentials?.password) {
                    console.log("Missing credentials");
                    return null;
                }

                const identifier = credentials.username.trim();
                const user = await prisma.user.findFirst({
                    where: {
                        OR: [{ username: identifier }, { email: identifier }],
                    },
                    include: {
                        department: { select: { name: true } },
                    },
                });

                console.log("Found user:", user ? user.username : 'null');

                if (!user || !user.password) {
                    console.log("User not found or no password");
                    return null;
                }

                const isValid = await compare(credentials.password, user.password);
                console.log("Password valid:", isValid);

                if (isValid) {
                    return {
                        id: user.id.toString(),
                        name: user.name,
                        email: user.email,
                        username: user.username, // Pass username to session
                        role: user.role,
                        division: user.department?.name ?? null,
                    };
                }
                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.division = (user as any).division ?? null;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.division = token.division as string;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET, // WAJIB ADA INI
    session: {
        strategy: "jwt",
    },
};
