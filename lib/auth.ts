import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";

const USERNAME_RE = /^[a-zA-Z0-9_-]{3,20}$/;
const VALID_GENDERS = new Set(["male", "female", "other"]);
const LANG_CODE_RE = /^[a-z]{2,3}$/;

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  // Built-in rate limiter: max 10 auth requests per 60-second window per IP.
  // Mitigates brute-force attacks on /api/auth/sign-in and /api/auth/sign-up.
  rateLimit: {
    enabled: true,
    window: 60,
    max: 10,
  },
  user: {
    additionalFields: {
      username:  { type: "string",  required: true,  unique: true, input: true },
      languages: { type: "string",  required: true,  input: true },
      age:       { type: "number",  required: true,  input: true },
      gender:    { type: "string",  required: true,  input: true },
      verified:  { type: "boolean", required: false, input: false, defaultValue: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Server-side age gate - cannot be bypassed via direct API calls
          const age = user.age as number | undefined;
          if (!Number.isInteger(age) || (age as number) < 18 || (age as number) > 120) {
            throw new APIError("BAD_REQUEST", { message: "You must be 18 or older to register." });
          }

          // Gender must be one of the three accepted values
          if (!VALID_GENDERS.has(user.gender as string)) {
            throw new APIError("BAD_REQUEST", { message: "Invalid gender value." });
          }

          // Username: alphanumeric, underscores, hyphens - 3–20 chars
          const username = user.username as string | undefined;
          if (!username || !USERNAME_RE.test(username)) {
            throw new APIError("BAD_REQUEST", {
              message: "Username must be 3–20 characters: letters, numbers, _ or - only.",
            });
          }

          // Languages must be a JSON array of valid ISO 639-1/639-3 codes
          try {
            const parsed: unknown = JSON.parse(user.languages as string);
            if (
              !Array.isArray(parsed) ||
              parsed.length === 0 ||
              !parsed.every((l) => typeof l === "string" && LANG_CODE_RE.test(l))
            ) {
              throw new Error();
            }
          } catch {
            throw new APIError("BAD_REQUEST", { message: "Provide at least one valid language code." });
          }

          return { data: user };
        },
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
});