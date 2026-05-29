import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <main className="min-h-screen bg-[#f5f4f1] text-foreground">
      <Outlet />
    </main>
  );
}
