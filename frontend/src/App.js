import "./App.css";
import CssBaseline from "@mui/material/CssBaseline";
import MainPage from "./components/pages/MainPage";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import TaskTypesPage from "./components/pages/TaskTypesPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
  },
  // TODO We could make this an Admin page instead, and move the user-management stuff to it, in the right-hand pane (task types on the left)
  {
    path: "task-types",
    element: <TaskTypesPage />,
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
