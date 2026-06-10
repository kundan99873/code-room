import RootLayout from "@/layout/rootLayout";
import HomePage from "@/pages/homePage";
import JsonPage from "@/pages/jsonPage";
import PlaygroundPage from "@/pages/playgroundPage";
import { createBrowserRouter } from "react-router-dom";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/playground",
        element: <PlaygroundPage />,
      },
      {
        path: "/json",
        element: <JsonPage />,
      },
      //   {
      //     path: "/auth",
      //     element: <AuthPage />,
      //   },
    ],
  },
]);

export default router;
