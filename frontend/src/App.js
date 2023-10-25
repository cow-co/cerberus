import "./App.css";
import CssBaseline from "@mui/material/CssBaseline";
import MainPage from "./components/pages/MainPage";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AdminPage from "./components/pages/AdminPage";
import ErrorPage from "./components/pages/ErrorPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "admin",
    element: <AdminPage />,
    errorElement: <ErrorPage />,
  },
]);

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme={true}>
        <RouterProvider router={router} />
      </CssBaseline>
    </ThemeProvider>
  );
}

export default App;
