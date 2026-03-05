import { createBrowserRouter } from "react-router";
import App from "../App";
import AskAI from "../pages/AskAI";
import Home from "../pages/Home";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/ask-ai",
    element: <AskAI />,
  },
  {
    path: "/app",
    element: <App />,
  }
]);
