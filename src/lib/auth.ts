import { cookies } from "next/headers";
import { prisma } from "./db";
import { scryptSync, randomBytes, timingSafeEqual, createHmac } from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET || "default-super-secret-key-at-least-32-chars-long";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hashedPassword = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hashedPassword}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(":");
    if (!salt || !key) return false;
    const hashedInput = scryptSync(password, salt, 64).toString("hex");
    return timingSafeEqual(Buffer.from(key, "hex"), Buffer.from(hashedInput, "hex"));
  } catch {
    return false;
  }
}

import { redis } from "./redis";

export interface RedisSessionData {
  userId: string;
  activeTab?: string;
  activeProjectId?: string;
  selectedClientId?: string;
  createdAt: number;
}

export interface SessionSettings {
  idleTimeout: number; // in seconds
  warningDuration: number; // in seconds
  absoluteTimeout: number; // in seconds
}

const DEFAULT_SETTINGS: SessionSettings = {
  idleTimeout: 900, // 15 minutes
  warningDuration: 60, // 60 seconds
  absoluteTimeout: 86400, // 24 hours
};

export async function getSessionSettings(): Promise<SessionSettings> {
  try {
    const cached = await redis.get("system:settings");
    if (cached) {
      return JSON.parse(cached);
    }

    const settings = await prisma.setting.findMany();
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    const merged: SessionSettings = {
      idleTimeout: settingsMap.idleTimeout ? Number(settingsMap.idleTimeout) : DEFAULT_SETTINGS.idleTimeout,
      warningDuration: settingsMap.warningDuration ? Number(settingsMap.warningDuration) : DEFAULT_SETTINGS.warningDuration,
      absoluteTimeout: settingsMap.absoluteTimeout ? Number(settingsMap.absoluteTimeout) : DEFAULT_SETTINGS.absoluteTimeout,
    };

    await redis.set("system:settings", JSON.stringify(merged));
    return merged;
  } catch (e) {
    console.error("Error reading system settings:", e);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSessionSettings(updates: Partial<SessionSettings>): Promise<SessionSettings> {
  const current = await getSessionSettings();
  const updated = { ...current, ...updates };

  const upsertPromises = Object.entries(updated).map(([key, value]) =>
    prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    })
  );
  await Promise.all(upsertPromises);

  await redis.set("system:settings", JSON.stringify(updated));
  return updated;
}

export async function createRedisSession(userId: string): Promise<string> {
  const sessionId = crypto.randomUUID();
  const settings = await getSessionSettings();
  const data: RedisSessionData = { 
    userId,
    createdAt: Date.now()
  };
  await redis.setex(`session:${sessionId}`, settings.idleTimeout, JSON.stringify(data));
  return sessionId;
}

export async function getRedisSession(sessionId: string): Promise<RedisSessionData | null> {
  const raw = await redis.get(`session:${sessionId}`);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as RedisSessionData;
    const settings = await getSessionSettings();
    const age = (Date.now() - data.createdAt) / 1000;
    if (age > settings.absoluteTimeout) {
      await redis.del(`session:${sessionId}`);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export async function touchRedisSession(sessionId: string, sessionData: RedisSessionData): Promise<void> {
  const settings = await getSessionSettings();
  const remainingAbsoluteTime = settings.absoluteTimeout - (Date.now() - sessionData.createdAt) / 1000;
  if (remainingAbsoluteTime <= 0) {
    await redis.del(`session:${sessionId}`);
    return;
  }
  const newTTL = Math.min(settings.idleTimeout, Math.floor(remainingAbsoluteTime));
  await redis.expire(`session:${sessionId}`, newTTL);
}

export async function updateRedisSession(sessionId: string, updates: Partial<Omit<RedisSessionData, "userId">>): Promise<void> {
  const session = await getRedisSession(sessionId);
  if (!session) return;
  const updated = { ...session, ...updates };
  const settings = await getSessionSettings();
  const remainingAbsoluteTime = settings.absoluteTimeout - (Date.now() - updated.createdAt) / 1000;
  if (remainingAbsoluteTime <= 0) {
    await redis.del(`session:${sessionId}`);
    return;
  }
  const newTTL = Math.min(settings.idleTimeout, Math.floor(remainingAbsoluteTime));
  await redis.setex(`session:${sessionId}`, newTTL, JSON.stringify(updated));
}

export async function deleteRedisSession(sessionId: string): Promise<void> {
  await redis.del(`session:${sessionId}`);
}

export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }

    const sessionData = await getRedisSession(sessionCookie.value);
    if (!sessionData || !sessionData.userId) {
      return null;
    }

    // Touch session on activity
    await touchRedisSession(sessionCookie.value, sessionData);

    const user = await prisma.user.findUnique({
      where: { id: sessionData.userId },
    });

    return user;
  } catch (error) {
    console.error("Session verification error:", error);
    return null;
  }
}

export async function getSessionWithPreferences() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");
    if (!sessionCookie || !sessionCookie.value) {
      return null;
    }

    const sessionData = await getRedisSession(sessionCookie.value);
    if (!sessionData || !sessionData.userId) {
      return null;
    }

    // Touch session on activity
    await touchRedisSession(sessionCookie.value, sessionData);

    const user = await prisma.user.findUnique({
      where: { id: sessionData.userId },
    });

    if (!user) return null;

    return {
      user,
      preferences: {
        activeTab: sessionData.activeTab || null,
        activeProjectId: sessionData.activeProjectId || null,
        selectedClientId: sessionData.selectedClientId || null,
      }
    };
  } catch (error) {
    console.error("Session preferences retrieval error:", error);
    return null;
  }
}
