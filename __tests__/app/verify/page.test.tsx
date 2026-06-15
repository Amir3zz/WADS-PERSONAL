/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import VerifyPage from "@/app/verify/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

jest.mock("@/lib/firebase", () => ({
  auth: {
    currentUser: null,
  },
}));

jest.mock("firebase/auth", () => ({
  getIdToken: jest.fn(),
  reload: jest.fn(),
  sendEmailVerification: jest.fn(),
}));

describe("VerifyPage", () => {
  it("renders the verification screen", () => {
    render(<VerifyPage />);

    expect(
      screen.getByRole("heading", { name: /verify your email/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /i have verified my email/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /resend verification email/i }),
    ).toBeInTheDocument();
  });
});