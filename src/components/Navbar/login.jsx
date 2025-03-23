// import React, { useState } from "react";
// import { signInWithEmailAndPassword } from "firebase/auth";
// import { db ,auth } from "../../firebaseConfig";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// import { useNavigate } from "react-router-dom";

// export const SignIn = () => {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const navigate= useNavigate();
//   // Handle input changes
//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };
 
//   // Handle Sign In
//   const handleSignIn = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       await signInWithEmailAndPassword(auth, formData.email, formData.password);
//       toast.success("Signed in successfully! 🎉");
//       setFormData({ email: "", password: "" }); // Reset form
//       navigate('/')
//     } catch (error) {
//       toast.error(error.message);
//     }

//     setLoading(false);
//   };


//   // Inline styles
// const styles = {
//     container: {
//       maxWidth: "400px",
//       margin: "50px auto",
//       padding: "20px",
//       textAlign: "center",
//       backgroundColor: "#fff",
//       borderRadius: "8px",
//       boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
//     },
//     heading: {
//       fontSize: "1.5rem",
//       marginBottom: "20px",
//       color: "#333",
//     },
//     form: {
//       display: "flex",
//       flexDirection: "column",
//       gap: "10px",
//     },
//     input: {
//       padding: "10px",
//       fontSize: "1rem",
//       border: "1px solid #ccc",
//       borderRadius: "5px",
//     },
//     button: {
//       padding: "10px",
//       fontSize: "1rem",
//       color: "white",
//       backgroundColor: "#007bff",
//       border: "none",
//       borderRadius: "5px",
//       cursor: "pointer",
//     },
//   };

//   return (
//     <div style={styles.container}>
//       <h2 style={styles.heading}>Sign In</h2>
//       <form onSubmit={handleSignIn} style={styles.form}>
//         <input
//           type="email"
//           name="email"
//           value={formData.email}
//           onChange={handleChange}
//           placeholder="Email"
//           required
//           style={styles.input}
//         />
//         <input
//           type="password"
//           name="password"
//           value={formData.password}
//           onChange={handleChange}
//           placeholder="Password"
//           required
//           style={styles.input}
//         />
//         <button type="submit"  disabled={loading} style={styles.button}>
//           {loading ? "Signing In..." : "Sign In"}
//         </button>
//       </form>
//       <ToastContainer />
//     </div>
//   );
// };

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { db ,auth } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";

export const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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

  return (
    <div style={{ 
      maxWidth: "400px", 
      margin: "50px auto", 
      padding: "20px", 
      borderRadius: "10px", 
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", 
      textAlign: "center",
      backgroundColor: "#fff" 
    }}>
      <h2 style={{ color: "#333", marginBottom: "20px" }}>Sign In</h2>
      {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
      <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input 
          type="email" 
          placeholder="Email" 
          onChange={(e) => setEmail(e.target.value)} 
          style={{ 
            padding: "10px", 
            border: "1px solid #ccc", 
            borderRadius: "5px", 
            fontSize: "16px" 
          }} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          onChange={(e) => setPassword(e.target.value)} 
          style={{ 
            padding: "10px", 
            border: "1px solid #ccc", 
            borderRadius: "5px", 
            fontSize: "16px" 
          }} 
        />
        <button 
          type="submit" 
          style={{ 
            padding: "10px", 
            border: "none", 
            borderRadius: "5px", 
            backgroundColor: "#007bff", 
            color: "#fff", 
            fontSize: "16px", 
            cursor: "pointer",
            transition: "background-color 0.3s"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}
        >
          Sign In
        </button>
      </form>
    </div>
    
  );
};
