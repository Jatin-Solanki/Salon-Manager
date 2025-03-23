// import { StoreApp } from "./Store";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppLayout } from "./Layout/applayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { HomePage } from "./pages/Home/homepage";
import { AboutPage } from "./pages/About/aboutpage";
import { LabPage } from "./pages/LabPage/labpage";
import { Publication } from "./pages/Publication/publication";
import { Expense } from "./pages/Expense/AddExpense";
import { History } from "./pages/History/History";
import { EditHistory } from "./pages/EditHistory/EditHistory";
import { SignIn } from "./components/Navbar/login";
import { AuthProvider } from "./context/AuthContext";

const router = createBrowserRouter([
  {
    path: "/",
    element: <SignIn />,
  },
  {
    path: "/applayout",
    element: <ProtectedRoute />, // Protect all routes under applayout
    children: [
      { path: "home", element: <HomePage /> },
      { path: "about", element: <AboutPage /> },
      { path: "lab", element: <LabPage /> },
      { path: "publication", element: <Publication /> },
      { path: "expense", element: <Expense /> },
      { path: "history", element: <History /> },
      { path: "edithistory", element: <EditHistory /> },
    ],
  },
]);

export const App = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};


