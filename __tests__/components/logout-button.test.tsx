/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LogoutButton from "@/components/logout-button";
import { toast } from "sonner";

const mockPush = jest.fn();
const mockRefresh = jest.fn();
const mockFetch = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
        refresh: mockRefresh,
    }),
}));

jest.mock("sonner", () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

describe("LogoutButton", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (globalThis as unknown as { fetch: typeof mockFetch }).fetch = mockFetch;
    });

    it("logs out the user and redirects to login", async () => {
        const user = userEvent.setup();

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: "Logged out" }),
        });

        render(<LogoutButton />);

        await user.click(
            screen.getByRole("button", { name: /sign out of your account/i }),
        );

        const confirmButton = await screen.findByRole("button", {
            name: /confirm logout/i,
        });

        await user.click(confirmButton);

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith("/api/logout", {
                method: "POST",
            });
        });

        expect(toast.success).toHaveBeenCalledWith("Successfully signed out");
        expect(mockPush).toHaveBeenCalledWith("/login");
        expect(mockRefresh).toHaveBeenCalled();
    });
});