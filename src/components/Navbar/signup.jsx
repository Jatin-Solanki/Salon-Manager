import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { db ,auth } from "../../firebaseConfig";
export const SignUp = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Sign Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // Store user in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: formData.email,
        role: "user", // Default role
        createdAt: new Date(),
      });

      toast.success("Sign up successful! 🎉");
      setFormData({ email: "", password: "" }); // Reset form
    } catch (error) {
      toast.error(error.message);
    }

    setLoading(false);
  };

  // Inline CSS styles
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
      <h2 style={styles.heading}>Sign Up</h2>
      <form onSubmit={handleSignUp} style={styles.form}>
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
          minLength="6"
          style={styles.input}
        />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};
