/**
 * Optional read-only demo account.
 *
 * When both variables are set, the landing page and login form offer a
 * one-click sign-in so visitors can look around without registering. These are
 * NEXT_PUBLIC_ on purpose: the credentials are meant to be public, so the demo
 * account should hold nothing but throwaway data.
 */
export const DEMO_EMAIL = process.env.NEXT_PUBLIC_DEMO_EMAIL ?? "";
export const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "";

export const isDemoEnabled = Boolean(DEMO_EMAIL && DEMO_PASSWORD);
