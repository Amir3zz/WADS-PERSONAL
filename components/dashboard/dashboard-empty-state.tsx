import CreateBoardForm from "@/components/dashboard/create-board-form";

export default function DashboardEmptyState() {
    return (
        <div className="rounded-3xl border border-dashed bg-background p-10 text-center shadow-sm">
            <h3 className="text-2xl font-semibold">No boards yet</h3>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                Create your first study board for Math, Biology, Literature, or anything else you are
                organizing.
            </p>
            <div className="mt-6 flex justify-center">
                <CreateBoardForm />
            </div>
        </div>
    );
}