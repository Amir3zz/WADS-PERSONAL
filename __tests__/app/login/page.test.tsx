/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/login/page";
import { toast } from "sonner";
import {
    getRedirectResult,
    reload,
    signInWithEmailAndPassword,
    signInWithRedirect,
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
    GoogleAuthProvider: jest.fn().mockImplementation(() => ({
        setCustomParameters: jest.fn(),
    })),
    getRedirectResult: jest.fn(),
    reload: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signInWithRedirect: jest.fn(),
    sendEmailVerification: jest.fn(),
}));

describe("LoginPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (globalThis as unknown as { fetch: typeof mockFetch }).fetch = mockFetch;
        (getRedirectResult as jest.Mock).mockResolvedValue(null);
    });

    it("starts Google sign-in with redirect", async () => {
        const user = userEvent.setup();

        (signInWithRedirect as jest.Mock).mockResolvedValueOnce(undefined);

        render(<LoginPage />);

        const googleButton = screen.getByRole("button", {
            name: /continue with google/i,
        });

        expect(googleButton).toBeEnabled();

        await user.click(googleButton);

        await waitFor(() => {
            expect(signInWithRedirect).toHaveBeenCalled();
        });
    });

    it("creates a session after returning from Google redirect", async () => {
        const getIdToken = jest.fn().mockResolvedValue("google-id-token");

        (getRedirectResult as jest.Mock).mockResolvedValueOnce({
            user: {
                getIdToken,
            },
        });

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true }),
        });

        render(<LoginPage />);

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                "/api/auth/firebase",
                expect.objectContaining({
                    method: "POST",
                    headers: {
                        Authorization: "Bearer google-id-token",
                    },
                }),
            );
        });

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith("/dashboard");
        });
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
