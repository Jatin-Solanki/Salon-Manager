import React from "react";
import { signOut } from "firebase/auth";
import { db ,auth } from "../../firebaseConfig";
import { toast } from "react-toastify";

export const Logout = () => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Logout failed: " + error.message);
    }
  };

  // Inline styles
const styles = {
    button: {
      padding: "10px 15px",
      fontSize: "1rem",
      color: "white",
      backgroundColor: "#dc3545",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    },
  };

  return (
    <button onClick={handleLogout} style={styles.button}>
      Logout
    </button>
  );
};