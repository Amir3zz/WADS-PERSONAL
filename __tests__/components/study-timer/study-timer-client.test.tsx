/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StudyTimerClient from "@/components/study-timer/study-timer-client";
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

describe("StudyTimerClient", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (globalThis as unknown as { fetch: typeof mockFetch }).fetch = mockFetch;
    });

    it("starts a timer and saves a session", async () => {
        jest.useFakeTimers();
        const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                id: "session-1",
                title: "Study session",
                subject: null,
                notes: null,
                startedAt: "2026-06-15T10:00:00.000Z",
                endedAt: "2026-06-15T10:01:05.000Z",
                durationMinutes: 1,
                createdAt: "2026-06-15T10:01:05.000Z",
                updatedAt: "2026-06-15T10:01:05.000Z",
                userId: "user-1",
            }),
        });

        render(<StudyTimerClient initialSessions={[]} />);

        await user.click(screen.getByRole("button", { name: /start/i }));

        await act(async () => {
            jest.advanceTimersByTime(65000);
        });

        expect(screen.getByText(/01:05/)).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: /save session/i }));

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
                "/api/study-sessions",
                expect.objectContaining({ method: "POST" }),
            );
        });

        expect(toast.success).toHaveBeenCalledWith("Study session saved");
        jest.useRealTimers();
    });
});