import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import TwitterProvider from "next-auth/providers/twitter";
import Db from '@/utils/db';
import User from '@/models/user';
import { randomBytes } from 'crypto';
import { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    TwitterProvider({
    clientId: process.env.TWITTER_CLIENT_ID,
    clientSecret: process.env.TWITTER_CLIENT_SECRET,
  })
  ],
  callbacks: {
    async signIn({ user }) {
      const cookieStore = cookies();
      console.log(user)
      try {
        await Db();
        let existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          const randomPassword = randomBytes(16).toString('hex');
          const hashedPassword = await hash(randomPassword, 10);
          if(!user.email){
            //user.email = 'abc@ok.com'
            throw new Error("Email address is required");
          }
          if(!user.name){
            user.name = user.email.split('@')[0]
          }
          if(!user.image){
            user.image = null
          }
          let userData = {
            email: user.email,
            name: user.name,
            image: user.image,
            password: hashedPassword,
          };
          existingUser = new User(userData);
          await existingUser.save();
        }

        const isValid = true
        const userDetails = await User.findOne({email: user.email})
        if (isValid) {
  const token = jwt.sign({ data: userDetails }, process.env.JWT_SECRET, { expiresIn: '10d' });

if (isValid) {
  const token = jwt.sign({ data: userDetails }, process.env.JWT_SECRET, { expiresIn: '10d' });
  
  cookieStore.set('token', token);

  return true;
}
} else {
          console.error('Invalid credentials.');
          return false;
        }
      } catch (error) {
        console.error('Error during sign-in:', error);
        return false;
      }
    },
  },
});

export {
  handler as GET,
  handler as POST,
};