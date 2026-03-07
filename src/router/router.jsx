import { createBrowserRouter } from "react-router";
import App from "../App";
import AskAI from "../pages/AskAI";
import ConceptSimplifier from "../pages/ConceptSimplifier";
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
  },
  {
    path: "/concept-simplifier",
    element: <ConceptSimplifier />,
  }
]);
