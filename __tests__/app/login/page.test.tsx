/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/login/page";
import { toast } from "sonner";
import {
    reload,
    signInWithEmailAndPassword,
} from "firebase/auth";

const mockPush = jest.fn();
const mockRefresh = jest.fn();
const mockFetch = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
        refresh: mockRefresh,
    }),
}));

jest.mock("@/lib/firebase", () => ({
    auth: {},
}));

jest.mock("sonner", () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock("firebase/auth", () => ({
    GoogleAuthProvider: jest.fn(),
    reload: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signInWithPopup: jest.fn(),
    sendEmailVerification: jest.fn(),
}));

describe("LoginPage", () => {
    const originalGoogleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    beforeEach(() => {
        jest.clearAllMocks();
        (globalThis as unknown as { fetch: typeof mockFetch }).fetch = mockFetch;
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = originalGoogleClientId;
        delete (window as typeof window & { google?: unknown }).google;
    });

    afterAll(() => {
        process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = originalGoogleClientId;
    });

    it("keeps the Google login button clickable while Google sign-in is unavailable", async () => {
        const user = userEvent.setup();

        delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

        render(<LoginPage />);

        const googleButton = screen.getByRole("button", {
            name: /continue with google/i,
        });

        expect(googleButton).toBeEnabled();

        await user.click(googleButton);

        expect(toast.error).toHaveBeenCalledWith("Missing Google client ID.");
    });

    it("does not submit when the email is invalid", async () => {
        const user = userEvent.setup();

        render(<LoginPage />);

        await user.type(screen.getByLabelText(/email/i), "not-an-email");
        await user.type(screen.getByLabelText(/password/i), "password123");

        await user.click(
            screen.getByRole("button", {
                name: /sign in with email/i,
            }),
        );

        await waitFor(() => {
            expect(signInWithEmailAndPassword).not.toHaveBeenCalled();
        });
    });

    it("signs in successfully and redirects", async () => {
        const user = userEvent.setup();

        const getIdToken = jest.fn().mockResolvedValue("id-token");

        (signInWithEmailAndPassword as jest.Mock).mockResolvedValueOnce({
            user: {
                emailVerified: true,
                getIdToken,
            },
        });

        (reload as jest.Mock).mockResolvedValueOnce(undefined);

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true }),
        });

        render(<LoginPage />);

        await user.type(
            screen.getByLabelText(/email/i),
            "student@example.com",
        );

        await user.type(
            screen.getByLabelText(/password/i),
            "password123",
        );

        await user.click(
            screen.getByRole("button", {
                name: /sign in with email/i,
            }),
        );

        await waitFor(() => {
            expect(signInWithEmailAndPassword).toHaveBeenCalled();
        });

        expect(mockFetch).toHaveBeenCalledWith(
            "/api/auth/firebase",
            expect.objectContaining({
                method: "POST",
                headers: {
                    Authorization: "Bearer id-token",
                },
            }),
        );

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/dashboard");
        });

        expect(toast.success).toHaveBeenCalledWith(
            "Login successful",
        );
    });
});
