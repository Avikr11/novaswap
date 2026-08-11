import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../../layouts/MainLayout";

import HomePage from "../../pages/HomePage";
import SwapPage from "../../pages/SwapPage";
import PortfolioPage from "../../pages/PortfolioPage";
import HistoryPage from "../../pages/HistoryPage";
import SettingsPage from "../../pages/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "swap",
        element: <SwapPage />,
      },
      {
        path: "portfolio",
        element: <PortfolioPage />,
      },
      {
        path: "history",
        element: <HistoryPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
]);