
// import { useState } from "react";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { db ,auth } from "../../firebaseConfig";
// import { useNavigate } from "react-router-dom";

// export const SignIn = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleSignIn = async (e) => {
//     e.preventDefault();
//     try {
//       await signInWithEmailAndPassword(auth, email, password);
//       navigate("/applayout"); // Redirect to home after login
//     } catch (err) {
//       setError("Invalid email or password");
//     }
//   };

//   return (
    
//     <>
      
//       <div style={{ 
//         maxWidth: "400px", 
//         margin: "50px auto", 
//         padding: "20px", 
//         borderRadius: "10px", 
//         boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", 
//         textAlign: "center",
//         backgroundColor: "#fff", 
//         position:"relative",
//         top:"80px"
//       }}>

//       <div>
//         <img src="./public/logo.png" height={"60px"} alt="" />
//         <h1 style={{margin:"20px"}}>Scissor & Style</h1>
//       </div>

//         <h2 style={{ color: "#333", marginBottom: "20px" }}>Log In</h2>
//         {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
//         <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
//           <input 
//             type="email" 
//             placeholder="Email" 
//             onChange={(e) => setEmail(e.target.value)} 
//             style={{ 
//               padding: "10px", 
//               border: "1px solid #ccc", 
//               borderRadius: "5px", 
//               fontSize: "16px" 
//             }} 
//           />
//           <input 
//             type="password" 
//             placeholder="Password" 
//             onChange={(e) => setPassword(e.target.value)} 
//             style={{ 
//               padding: "10px", 
//               border: "1px solid #ccc", 
//               borderRadius: "5px", 
//               fontSize: "16px" 
//             }} 
//           />
//           <button 
//             type="submit" 
//             style={{ 
//               padding: "10px", 
//               border: "none", 
//               borderRadius: "5px", 
//               backgroundColor: "#007bff", 
//               color: "#fff", 
//               fontSize: "16px", 
//               cursor: "pointer",
//               transition: "background-color 0.3s"
//             }}
//             onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
//             onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}
//           >
//             Sign In
//           </button>
//         </form>
//       </div>
//     </>

    
//   );
// };

import { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";

export const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/applayout"); // Redirect to home after login
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email to reset password");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent. Check your inbox.");
      setError("");
    } catch (err) {
      setError("Failed to send password reset email. Please try again.");
    }
  };

  return (
    <>
      <div style={{ 
        maxWidth: "400px", 
        margin: "50px auto", 
        padding: "20px", 
        borderRadius: "10px", 
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", 
        textAlign: "center",
        backgroundColor: "#fff", 
        position: "relative",
        top: "80px"
      }}>
        <div>
          <img src="/logo.png" height={"60px"} alt="" />
          <h1 style={{ margin: "20px" }}>Scissor & Style</h1>
        </div>
        <h2 style={{ color: "#333", marginBottom: "20px" }}>Log In</h2>
        {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
        {message && <p style={{ color: "green", fontSize: "14px" }}>{message}</p>}
        <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <input 
            type="email" 
            placeholder="Email" 
            onChange={(e) => setEmail(e.target.value)} 
            style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "5px", fontSize: "16px" }} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            onChange={(e) => setPassword(e.target.value)} 
            style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "5px", fontSize: "16px" }} 
          />
          <button 
            type="submit" 
            style={{ padding: "10px", border: "none", borderRadius: "5px", backgroundColor: "#007bff", color: "#fff", fontSize: "16px", cursor: "pointer", transition: "background-color 0.3s" }}
            onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
            onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}
          >
            Sign In
          </button>
        </form>
        <p 
          onClick={handleResetPassword} 
          style={{ color: "#007bff", cursor: "pointer", marginTop: "10px", textDecoration: "underline" }}
        >
          Forgot Password?
        </p>
      </div>
    </>
  );
};

