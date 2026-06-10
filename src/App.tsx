import { RouterProvider } from "react-router-dom";
import router from "./router/appRouter";
import { ThemeProvider } from "./context/themeContext";

export default function App() {
  return (
    <div>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </div>
  );
}
