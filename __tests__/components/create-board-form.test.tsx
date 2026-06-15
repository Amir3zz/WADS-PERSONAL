/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CreateBoardForm from "@/components/dashboard/create-board-form";
import { toast } from "sonner";

const mockRefresh = jest.fn();
const mockFetch = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        refresh: mockRefresh,
    }),
}));

jest.mock("sonner", () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

describe("CreateBoardForm", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (globalThis as unknown as { fetch: typeof mockFetch }).fetch = mockFetch;
    });

    it("creates a board with trimmed values", async () => {
        const user = userEvent.setup();

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                id: "1",
                title: "New Board",
            }),
        });

        render(<CreateBoardForm />);

        await user.click(screen.getByRole("button", { name: /add board/i }));

        await user.type(screen.getByPlaceholderText(/board title/i), "  New Board  ");
        await user.type(
            screen.getByPlaceholderText(/short description/i),
            "  Plan for this week  ",
        );

        await user.click(screen.getByRole("button", { name: /create board/i }));

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                "/api/boards",
                expect.objectContaining({
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        title: "New Board",
                        description: "Plan for this week",
                    }),
                }),
            );
        });

        expect(toast.success).toHaveBeenCalledWith("Board created");
        expect(mockRefresh).toHaveBeenCalled();
    });

    it("rejects an empty title", async () => {
        const user = userEvent.setup();

        render(<CreateBoardForm />);

        await user.click(screen.getByRole("button", { name: /add board/i }));
        await user.click(screen.getByRole("button", { name: /create board/i }));

        expect(toast.error).toHaveBeenCalledWith("Board title is required");
        expect(mockFetch).not.toHaveBeenCalled();
    });
});