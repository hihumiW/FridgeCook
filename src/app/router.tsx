import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { HomePage } from "@/pages/HomePage";

const EmptyRoute = () => null;

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "ingredients", element: <EmptyRoute /> },
      { path: "seasonings", element: <EmptyRoute /> },
      { path: "results", element: <EmptyRoute /> },
      { path: "recipe/:id", element: <EmptyRoute /> },
    ],
  },
]);
