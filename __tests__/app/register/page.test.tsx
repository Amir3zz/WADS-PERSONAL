/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import RegisterPage from "@/app/register/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

// Mock Firebase so Jest doesn't run the real firebase.ts
jest.mock("@/lib/firebase", () => ({
  auth: {},
}));

// Mock Firebase auth functions used in the page
jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
}));

jest.mock("@/lib/auth-client", () => ({
  authClient: {
    signUp: {
      email: jest.fn(),
    },
  },
}));

describe("RegisterPage", () => {
  it("renders link to login", () => {
    render(<RegisterPage />);

    const link = screen.getByRole("link", { name: /sign in/i });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/login");
  });
});