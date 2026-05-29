import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import { HomePage } from "@/pages/HomePage";
import { IngredientsPage } from "@/pages/IngredientsPage";
import { RecipeDetailPage } from "@/pages/RecipeDetailPage";
import { ResultsPage } from "@/pages/ResultsPage";
import { SeasoningsPage } from "@/pages/SeasoningsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "ingredients", element: <IngredientsPage /> },
      { path: "seasonings", element: <SeasoningsPage /> },
      { path: "results", element: <ResultsPage /> },
      { path: "recipe/:id", element: <RecipeDetailPage /> },
    ],
  },
]);
