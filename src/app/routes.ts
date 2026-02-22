import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Activate from "./pages/Activate";
import Input from "./pages/Input";
import Loading from "./pages/Loading";
import Result from "./pages/Result";
import Admin from "./pages/Admin";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/activate",
    Component: Activate,
  },
  {
    path: "/input",
    Component: Input,
  },
  {
    path: "/loading",
    Component: Loading,
  },
  {
    path: "/result",
    Component: Result,
  },
  {
    path: "/admin",
    Component: Admin,
  },
]);
