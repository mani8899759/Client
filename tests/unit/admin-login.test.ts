import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Admin Sign In & Authentication Cleanliness", () => {
  it("ensures GitHub sign-in UI and logic are completely removed from AuthForms.tsx", () => {
    const authFormsPath = path.join(process.cwd(), "src/app/admin/AuthForms.tsx");
    const source = fs.readFileSync(authFormsPath, "utf8");

    // Must not contain GitHub OAuth button, icon, or handler
    expect(source.toLowerCase()).not.toContain("github");
    expect(source).not.toContain("Continue with GitHub");
    expect(source).not.toContain("signInWithOAuth");
    expect(source).not.toContain("GithubIcon");
    expect(source).not.toContain("githubPending");
    expect(source).not.toContain("githubError");

    // Must contain Email, Password, and Submit button
    expect(source).toContain('label="Email address"');
    expect(source).toContain('label="Password"');
    expect(source).toContain('type="submit"');
    expect(source).toContain("Sign in");
  });

  it("ensures Admin Login page renders without unused divider or OAuth wrapper", () => {
    const loginPagePath = path.join(process.cwd(), "src/app/admin/login/page.tsx");
    const source = fs.readFileSync(loginPagePath, "utf8");

    expect(source.toLowerCase()).not.toContain("github");
    expect(source).toContain("<LoginForm");
  });
});
