import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import EmailProvider from 'next-auth/providers/email'
import CredentialsProvider from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@auth/mongodb-adapter'
import { MongoClient } from 'mongodb'
import dbConnect from './mongodb'
import User from './models/User'

const client = new MongoClient(process.env.MONGODB_URI!)
const clientPromise = client.connect()

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: process.env.MONGODB_DB_NAME || "test",
    collections: {
      Users: "nextauth_users",
      Accounts: "nextauth_accounts", 
      Sessions: "nextauth_sessions",
      VerificationTokens: "nextauth_verification_tokens"
    }
  }),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          await dbConnect()
          
          // Find user with password field included
          const user = await User.findOne({ email: credentials.email.toLowerCase() })
            .select('+password')
          
          if (!user) {
            return null
          }

          // Check if email is verified (skip for admin users)
          const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || []
          const isAdmin = adminEmails.includes(user.email.toLowerCase())
          
          if (!user.emailVerified && !isAdmin) {
            throw new Error('Please verify your email before signing in')
          }

          // Verify password
          const isPasswordValid = await user.comparePassword(credentials.password)
          if (!isPasswordValid) {
            return null
          }

          // Return user object
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw error
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    EmailProvider({
      server: `smtp://${process.env.EMAIL_SERVER_USER}:${process.env.EMAIL_SERVER_PASSWORD}@${process.env.EMAIL_SERVER_HOST}:${process.env.EMAIL_SERVER_PORT}`,
      from: process.env.EMAIL_FROM,
      maxAge: 24 * 60 * 60, // 24 hours
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Include isAdmin in the token when user first signs in
      if (account && user) {
        await dbConnect()
        const dbUser = await User.findOne({ email: user.email })
        if (dbUser) {
          token.isAdmin = dbUser.isAdmin
          token.emailVerified = dbUser.emailVerified
          token.id = dbUser._id.toString()
        }
      }
      return token
    },
    async session({ session, token, user }) {
      if (session?.user?.email) {
        await dbConnect()
        const dbUser = await User.findOne({ email: session.user.email })
        
        if (dbUser) {
          session.user.id = dbUser._id.toString()
          session.user.isAdmin = dbUser.isAdmin
          session.user.emailVerified = dbUser.emailVerified
        }
      }
      // Also set from token in case db lookup fails
      if (token) {
        session.user.id = token.id as string
        session.user.isAdmin = token.isAdmin as boolean
        session.user.emailVerified = token.emailVerified as boolean
      }
      return session
    },
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === 'google' || account?.provider === 'email') {
          await dbConnect()
          
          // Check if user exists in your custom User model
          let customUser = await User.findOne({ email: user.email })
          
          if (!customUser) {
            // Check if this is an admin email
            const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || []
            const isAdmin = adminEmails.includes(user.email?.toLowerCase() || '')
            
            // Create user in your custom User model to maintain consistency
            customUser = await User.create({
              email: user.email,
              name: user.name || user.email?.split('@')[0],
              image: user.image,
              emailVerified: true,
              isAdmin: isAdmin,
              provider: account.provider
            })
          } else {
            // If existing user becomes admin, ensure they're verified
            const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim().toLowerCase()) || []
            if (adminEmails.includes(user.email?.toLowerCase() || '')) {
              customUser.isAdmin = true
              customUser.emailVerified = true
              await customUser.save()
            }
          }
          
          return true
        }
        
        return true
      } catch (error) {
        console.error('Sign in error:', error)
        return true // Allow sign in even if custom user creation fails
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      isAdmin: boolean
      emailVerified: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    isAdmin?: boolean
    emailVerified?: boolean
  }
}
