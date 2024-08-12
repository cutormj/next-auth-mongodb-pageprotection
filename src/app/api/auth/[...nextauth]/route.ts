// lib/auth.ts

import NextAuth, { NextAuthOptions, User as AuthUser } from "next-auth";
import { Account } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import { connectToDatabase } from "@/utils/db";

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        // Connect to the database
        await connectToDatabase();
        try {
          // Find the user by email
          const user = await User.findOne({ email: credentials.email });
          if (user) {
            // Compare the provided password with the stored password
            const isPasswordCorrect = await bcrypt.compare(
              credentials.password,
              user.password
            );
            if (isPasswordCorrect) {
              // Return the user object if the password is correct
              return user;
            }
          }
        } catch (err: any) {
          // Handle any errors that occur during the authorization process
          throw new Error(err);
        }
      },
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID ?? "", // GitHub Client ID from environment variables
      clientSecret: process.env.GITHUB_SECRET ?? "", // GitHub Client Secret from environment variables
    }),
    // Add more providers here if needed
  ],
  callbacks: {
    // Callback to handle sign-in logic
    async signIn({ user, account }: { user: AuthUser; account: Account | null }) {
      if (account?.provider === "credentials") {
        // Allow sign-in for credentials provider
        return true;
      }
      if (account?.provider === "github") {
        // Connect to the database
        await connectToDatabase();
        try {
          // Check if the user already exists in the database
          const existingUser = await User.findOne({ email: user.email });
          if (!existingUser) {
            // Create a new user if they don't exist
            const newUser = new User({
              email: user.email,
            });

            // Save the new user to the database
            await newUser.save();
            return true;
          }
          return true;
        } catch (err) {
          // Log any errors that occur during the sign-in process
          console.log("Error saving user", err);
          return false;
        }
      }
      return false;
    },
  },
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
