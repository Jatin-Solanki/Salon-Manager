// import { StoreApp } from "./Store";

import { Navbar } from "./components/Navbar/Navbar"
import "./App.css";
import { HomePage } from "./pages/Home/homepage";
import { AboutPage } from "./pages/About/aboutpage";
import { LabPage } from "./pages/LabPage/labpage";
import { Publication } from "./pages/Publication/publication";
import { Expense } from "./pages/Expense/AddExpense";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AppLayout } from "./Layout/applayout";
export const App=()=>{
  const router= createBrowserRouter([
    {
      path:"/",
      element:<AppLayout/>,
      children:[
        {
          path:"/",
          element:<HomePage/>,
        },
        {
          path:"/about",
          element:<AboutPage/>,
        },
        {
          path:"/lab",
          element:<LabPage/>,
        },
        {
          path:"/publication",
          element:<Publication/>,
        },
        {
          path:"/expense",
          element:<Expense/>,
        },
      ]
    }
  ]);
  return <RouterProvider router={router}/>;
}


