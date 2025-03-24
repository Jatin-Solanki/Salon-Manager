// import { Navigate, Outlet } from "react-router-dom";
// import { useAuth } from "/src/context/AuthContext";
// import { useLocation } from "react-router-dom";


// const userPermissions = {
//     "email1@example.com": ["/applayout","/applayout/home", "/applayout/about", "/applayout/lab", "/applayout/publication", "/applayout/history"],
//     "email2@example.com": ["all"], // Use an array for consistency
//   };
  
//   export const ProtectedRoute = () => {
//     const { user } = useAuth();
//     const location = useLocation(); // Get current route
  
//     // Redirect to sign-in if user is not authenticated
//     if (!user || !user.email) return <Navigate to="/signin" replace />;
  
//     const allowedPages = userPermissions[user.email] || [];
//     const currentPath = location.pathname;
  
//     // If user has access to all pages or the current path, allow navigation
//     if (allowedPages.includes("all") || allowedPages.includes(currentPath)) {
//       return <Outlet />;
//     }
  
//     // Redirect unauthorized users to "/applayout/home"
//     return <Navigate to="/applayout/home" replace />;
//   };
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "/src/context/AuthContext";
import { AppLayout } from "../Layout/applayout"; // Ensure correct import

const userPermissions = {
  "scissors.style.unisex@gmail.com": ["/applayout/home", "/applayout/about", "/applayout/lab", "/applayout/history"],
  "solankisumit36@gmail.com": ["all"], // Consistent structure
};

export const ProtectedRoute = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user || !user.email) return <Navigate to="/" replace />;

  const allowedPages = userPermissions[user.email] || [];
  const currentPath = location.pathname;

  if (allowedPages.includes("all") || allowedPages.includes(currentPath)) {
    return (
      <AppLayout>
        <Outlet />
      </AppLayout>
    );
  }

  return <Navigate to="/applayout/home" replace />;
};
