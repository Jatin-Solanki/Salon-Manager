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
import { History } from "./pages/History/History";
import { EditHistory } from "./pages/EditHistory/EditHistory";
import { SignUp } from "./components/Navbar/signup";
import { SignIn } from "./components/Navbar/login";
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
        {
          path:"/history",
          element:<History/>
        },
        {
          path:"/edithistory",
          element:<EditHistory/>
        },
        {
          path:"/signup",
          element:<SignUp/>
        },
         {
          path:"/signup",
          element:<SignUp/>
        },
      ]
    }
  ]);
  return <RouterProvider router={router}/>;
}


