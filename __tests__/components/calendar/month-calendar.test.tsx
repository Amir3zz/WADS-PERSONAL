/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import MonthCalendar from "@/components/calendar/month-calendar";

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
                        dueDate: "2026-06-15T10:00:00.000Z",
                        description: null,
                        completed: false,
                        priority: null,
                        boardTitle: "Study Board",
                        columnTitle: "To do",
                    },
                ]}
            />,
        );

        expect(screen.getByText("June 2026")).toBeInTheDocument();

        expect(
            screen.getAllByText("Essay draft").length,
        ).toBeGreaterThan(0);

        expect(
            screen.getAllByText("Study Board · To do").length,
        ).toBeGreaterThan(0);

        expect(
            screen.getByRole("link", { name: /previous/i }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("link", { name: /next/i }),
        ).toBeInTheDocument();
    });
});