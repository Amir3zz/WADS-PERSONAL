/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import MonthCalendar from "@/components/calendar/month-calendar";

jest.mock("next/link", () => ({
    __esModule: true,
    default: ({ href, children, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

describe("MonthCalendar", () => {
    it("renders a calendar day and upcoming task", () => {
        render(
            <MonthCalendar
                year={2026}
                month={5}
                cards={[
                    {
                        id: "card-1",
                        title: "Essay draft",
                        description: null,
                        dueDate: "2026-06-15T10:00:00.000Z",
                        completed: false,
                        priority: null,
                        boardTitle: "Study Board",
                        columnTitle: "To do",
                    },
                ]}
            />,
        );

        expect(screen.getByText("June 2026")).toBeInTheDocument();
        expect(screen.getByText("Essay draft")).toBeInTheDocument();
        expect(screen.getByText("Study Board · To do")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /previous/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /next/i })).toBeInTheDocument();
    });
});