import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { History } from "./pages/History";
import { Advisor } from "./pages/Advisor";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "history", Component: History },
      { path: "advisor", Component: Advisor },
    ],
  },
]);
