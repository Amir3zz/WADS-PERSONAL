/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import VerifyPage from "@/app/verify/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn().mockReturnValue("mock-oob-code"),
  }),
}));

describe("VerifyPage", () => {
  it("renders verification message", () => {
    render(<VerifyPage />);

    const text = screen.getByText(/verify/i);
    expect(text).toBeInTheDocument();
  });
});