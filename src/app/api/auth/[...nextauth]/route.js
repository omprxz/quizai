import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import TwitterProvider from "next-auth/providers/twitter";
import Db from "@/utils/db";
import User from "@/models/user";
import { randomBytes } from "crypto";
import { hash } from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET
        }),
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET
        }),
        TwitterProvider({
            clientId: process.env.TWITTER_CLIENT_ID,
            clientSecret: process.env.TWITTER_CLIENT_SECRET
        })
    ],
    callbacks: {
        async signIn({ user, account, profile, email, credentials }) {
            const cookieStore = cookies();
            try {
                await Db();
                let existingUser = await User.findOne({ email: user.email });
                if (!existingUser) {
                    const randomPassword = randomBytes(16).toString("hex");
                    const hashedPassword = await hash(randomPassword, 10);
                    if (!user.email) throw new Error("Email address is required");
                    if (!user.name) user.name = user.email.split("@")[0];
                    if (!user.image) user.image = null;
                    let userData = {
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        password: hashedPassword
                    };
                    existingUser = new User(userData);
                    await existingUser.save();
                }

                const token = jwt.sign(
                    { data: existingUser },
                    process.env.JWT_SECRET,
                    { expiresIn: "10d" }
                );
                cookieStore.set("token", token, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60
})

                user.token = token;
                return true;
            } catch (error) {
                console.error("Error during sign-in:", error);
                return false;
            }
        },

        async redirect({ url, baseUrl }) {
            const parsedUrl = new URL(url, baseUrl);
            const target = parsedUrl.searchParams.get('target') || '';
            return `/social-auth/sign-in${target ? `?target=${encodeURIComponent(target)}` : ''}`;
        },

        async jwt({ token, user }) {
            if (user?.token) {
                token.accessToken = user.token;
            }
            return token;
        },

        async session({ session, token }) {
            session.accessToken = token.accessToken;
            return session;
        },
    },
});

export { handler as GET, handler as POST };