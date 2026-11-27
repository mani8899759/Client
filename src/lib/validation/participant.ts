import { z } from "zod";

/**
 * Normalise an Indian mobile number to E.164 (+91XXXXXXXXXX).
 * Accepts common formats: 9876543210, 09876543210, 919876543210,
 * +91 98765 43210, (+91) 98765-43210. Returns null when invalid.
 */
export function normalizeIndianMobile(input: string): string | null {
  const raw = input.trim();
  if (!raw || raw.length > 32 || !/^[\d\s()+.-]+$/.test(raw)) return null;
  let digits = raw.replace(/\D/g, "");
  // Strip leading 0s if length > 10
  while (digits.startsWith("0") && digits.length > 10) {
    digits = digits.slice(1);
  }
  // Strip country code 91 if 12 digits
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 13 && digits.startsWith("091")) {
    digits = digits.slice(3);
  }
  // Final check for 11 digits starting with 0
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  if (!/^[6-9]\d{9}$/.test(digits)) return null;
  return `+91${digits}`;
}

export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}

export function collapseWhitespace(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

/** Display a normalised number as +91 98765 43210. */
export function formatMobile(normalized: string): string {
  const m = /^\+91(\d{5})(\d{5})$/.exec(normalized);
  return m ? `+91 ${m[1]} ${m[2]}` : normalized;
}

const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const fullNameSchema = z
  .string({ error: "Enter your full name." })
  .transform(collapseWhitespace)
  .pipe(
    z
      .string()
      .min(2, "Enter your full name.")
      .max(120, "Name must be 120 characters or fewer.")
      .regex(NAME_PATTERN, "Use letters, spaces, apostrophes, dots or hyphens only."),
  );

export const mobileSchema = z
  .string({ error: "Enter your mobile number." })
  .trim()
  .min(1, "Enter your mobile number.")
  .refine((v) => normalizeIndianMobile(v) !== null, "Enter a valid 10-digit Indian mobile number.");

export const emailSchema = z
  .string({ error: "Enter your email address." })
  .trim()
  .min(1, "Enter your email address.")
  .max(254, "Email address is too long.")
  .refine((v) => EMAIL_PATTERN.test(v), "Enter a valid email address.");

export const addressSchema = z
  .string({ error: "Enter your address." })
  .trim()
  .min(5, "Enter your full address.")
  .max(500, "Address must be 500 characters or fewer.");

export const genderSchema = z.enum(["male", "female"], { error: "Select your gender." });
export const sideSchema = z.enum(["bride", "groom"], { error: "Choose Bride Side or Groom Side." });

export const registrationSchema = z.object({
  fullName: fullNameSchema,
  mobile: mobileSchema,
  email: emailSchema,
  gender: genderSchema,
  address: addressSchema,
  side: sideSchema,
  consent: z.literal(true, { error: "Please accept the consent statement to continue." }),
  requestId: z.uuid("Invalid request. Please refresh the page and try again."),
  /** Honeypot: real users never fill this hidden field. */
  website: z.string().max(0).optional(),
});

export type RegistrationInput = z.input<typeof registrationSchema>;

export const verificationSchema = z.object({
  mobile: mobileSchema,
});

/** Admin correction form (side included; owner check happens in the database). */
export const participantCorrectionSchema = z.object({
  participantId: z.uuid(),
  fullName: fullNameSchema,
  mobile: mobileSchema,
  email: emailSchema,
  gender: genderSchema,
  address: addressSchema,
  side: sideSchema,
  reason: z.string().trim().min(5, "Give a reason of at least 5 characters.").max(500),
});

export type FieldErrors = Record<string, string[] | undefined>;

export function fieldErrorsOf(error: z.ZodError): FieldErrors {
  return z.flattenError(error).fieldErrors as FieldErrors;
}
