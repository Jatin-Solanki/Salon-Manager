import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { db ,auth } from "../../firebaseConfig";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useNavigate } from "react-router-dom";

export const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate= useNavigate();
  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
 
  // Handle Sign In
  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      toast.success("Signed in successfully! 🎉");
      setFormData({ email: "", password: "" }); // Reset form
      navigate('/home')
    } catch (error) {
      toast.error(error.message);
    }

    setLoading(false);
  };


  // Inline styles
const styles = {
    container: {
      maxWidth: "400px",
      margin: "50px auto",
      padding: "20px",
      textAlign: "center",
      backgroundColor: "#fff",
      borderRadius: "8px",
      boxShadow: "0px 2px 10px rgba(0,0,0,0.1)",
    },
    heading: {
      fontSize: "1.5rem",
      marginBottom: "20px",
      color: "#333",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },
    input: {
      padding: "10px",
      fontSize: "1rem",
      border: "1px solid #ccc",
      borderRadius: "5px",
    },
    button: {
      padding: "10px",
      fontSize: "1rem",
      color: "white",
      backgroundColor: "#007bff",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Sign In</h2>
      <form onSubmit={handleSignIn} style={styles.form}>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          required
          style={styles.input}
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          required
          style={styles.input}
        />
        <button type="submit"  disabled={loading} style={styles.button}>
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};