"use server";

import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

// ==================== TYPES ====================

export interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    fullName: string;
  };
  error?: string;
}

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
}

// ==================== SESSION MANAGEMENT ====================

const SESSION_COOKIE_NAME = "align_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Create a simple session token (in production, use a proper JWT or session store)
 */
function createSessionToken(userId: string): string {
  // Simple base64 encoding with timestamp for basic security
  const payload = JSON.stringify({
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_MAX_AGE * 1000,
  });
  return Buffer.from(payload).toString("base64");
}

/**
 * Decode session token
 */
function decodeSessionToken(token: string): { userId: string; expiresAt: number } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, "base64").toString());
    if (payload.expiresAt < Date.now()) {
      return null; // Token expired
    }
    return payload;
  } catch {
    return null;
  }
}

// ==================== AUTH ACTIONS ====================

/**
 * Register a new user
 */
export async function register(
  email: string,
  password: string,
  fullName: string
): Promise<AuthResult> {
  try {
    // Validate inputs
    if (!email || !password || !fullName) {
      return { success: false, error: "Tous les champs sont requis" };
    }

    if (password.length < 6) {
      return { success: false, error: "Le mot de passe doit contenir au moins 6 caractères" };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { success: false, error: "Un compte existe déjà avec cet email" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        fullName,
      },
    });

    // Create session
    const sessionToken = createSessionToken(user.id);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  } catch (error) {
    console.error("Register error:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de l'inscription",
    };
  }
}

/**
 * Login user
 */
export async function login(email: string, password: string): Promise<AuthResult> {
  try {
    // Validate inputs
    if (!email || !password) {
      return { success: false, error: "Email et mot de passe requis" };
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { success: false, error: "Email ou mot de passe incorrect" };
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return { success: false, error: "Email ou mot de passe incorrect" };
    }

    // Create session
    const sessionToken = createSessionToken(user.id);
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE,
      path: "/",
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      error: "Une erreur est survenue lors de la connexion",
    };
  }
}

/**
 * Logout user
 */
export async function logout(): Promise<{ success: boolean }> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false };
  }
}

/**
 * Get current session user
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return null;
    }

    const decoded = decodeSessionToken(sessionToken);
    if (!decoded) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Get session error:", error);
    return null;
  }
}

/**
 * Check if user is authenticated (for use in server components)
 */
export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("Non authentifié");
  }
  return session;
}

/**
 * Update user profile
 */
export async function updateProfile(
  fullName: string
): Promise<AuthResult> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifié" };
    }

    const user = await prisma.user.update({
      where: { id: session.id },
      data: { fullName },
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  } catch (error) {
    console.error("Update profile error:", error);
    return {
      success: false,
      error: "Une erreur est survenue",
    };
  }
}

/**
 * Change password
 */
export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Non authentifié" };
    }

    if (newPassword.length < 6) {
      return { success: false, error: "Le nouveau mot de passe doit contenir au moins 6 caractères" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
    });

    if (!user) {
      return { success: false, error: "Utilisateur non trouvé" };
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return { success: false, error: "Mot de passe actuel incorrect" };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: session.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (error) {
    console.error("Change password error:", error);
    return {
      success: false,
      error: "Une erreur est survenue",
    };
  }
}
