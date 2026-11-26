"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE,
  accessToken,
  safeEqual,
  safeNext,
  sitePassword,
} from "@/lib/access";

export interface EnterState {
  error?: string;
}

export async function enter(_previous: EnterState, formData: FormData): Promise<EnterState> {
  const password = sitePassword();
  if (!password) return { error: "The site password hasn't been set up yet." };

  const [given, expected] = await Promise.all([
    accessToken(String(formData.get("password") ?? "")),
    accessToken(password),
  ]);
  if (!safeEqual(given, expected)) {
    await new Promise((resolve) => setTimeout(resolve, 500)); // Slow down guessing.
    return { error: "That password isn't right." };
  }

  (await cookies()).set(ACCESS_COOKIE, expected, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_MAX_AGE,
  });
  redirect(safeNext(formData.get("next")));
}

export async function signOut() {
  (await cookies()).delete(ACCESS_COOKIE);
  redirect("/enter");
}
