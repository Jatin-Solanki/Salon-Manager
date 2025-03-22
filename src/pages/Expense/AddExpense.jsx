import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { collection, addDoc, onSnapshot, query, where, getDocs, updateDoc, doc, Timestamp } from "firebase/firestore";

export const Expense = () => {
  const [expense, setExpense] = useState({ name: "", price: "" });
  const [expenses, setExpenses] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalExpense, setTotalExpense] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [owner, setOwner] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = () => {
    const q = query(collection(db, "expenses"));
    onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setExpenses(data.filter(exp => exp.date).sort((a, b) => b.date.toMillis() - a.date.toMillis()));
    });
  };

  const addOrUpdateExpense = async () => {
    if (!expense.name || !expense.price) return;
    try {
      if (editingId) {
        await updateDoc(doc(db, "expenses", editingId), {
          name: expense.name,
          price: parseFloat(expense.price),
        });
        setEditingId(null);
      } else {
        await addDoc(collection(db, "expenses"), {
          name: expense.name,
          price: parseFloat(expense.price),
          date: Timestamp.now(),
          owner: owner,
        });
      }
      setExpense({ name: "", price: "" });
    } catch (error) {
      console.error("Error saving expense: ", error);
    }
  };

    const [expandedRows, setExpandedRows] = useState({});

  const toggleReadMore = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchFilteredExpenses = async () => {
    if (!startDate || !endDate) return;
    const start = Timestamp.fromDate(new Date(startDate + "T00:00:00"));
    const end = Timestamp.fromDate(new Date(endDate + "T23:59:59"));
    
    try {
      let q = query(
        collection(db, "expenses"), 
        where("date", ">=", start), 
        where("date", "<=", end)
      );
      
      if (owner) {
        q = query(q, where("owner", "==", owner));
      }
      
      const querySnapshot = await getDocs(q);
      const filteredExpenses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(exp => exp.date);
      setExpenses(filteredExpenses.sort((a, b) => b.date.toMillis() - a.date.toMillis()));
    } catch (error) {
      console.error("Error fetching filtered expenses: ", error);
    }
  };

  return (
    <div
    style={{
      position:"absolute",
      right:"200px",
      padding: "20px",
      border: "2px solid #ccc",
      borderRadius: "10px",
      maxWidth: "800px",
      margin: "20px auto",
      backgroundColor: "#f9f9f9",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    }}
  >
    <h2 style={{ textAlign: "center", color: "#333", marginBottom: "15px" }}>
      {editingId ? "Edit Expense" : "Add Expense"}
    </h2>

    <input
      type="text"
      placeholder="Expense Name"
      value={expense.name}
      onChange={(e) => setExpense({ ...expense, name: e.target.value })}
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "10px",
        border: "1px solid #ccc",
        borderRadius: "5px",
      }}
    />
    <input
      type="number"
      placeholder="Price"
      value={expense.price}
      onChange={(e) => setExpense({ ...expense, price: e.target.value })}
      style={{
        width: "100%",
        padding: "10px",
        marginBottom: "10px",
        border: "1px solid #ccc",
        borderRadius: "5px",
      }}
    />
    <button
      onClick={addOrUpdateExpense}
      style={{
        width: "100%",
        padding: "10px",
        backgroundColor: "#28a745",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        fontWeight: "bold",
        transition: "background 0.3s",
      }}
      onMouseOver={(e) => (e.target.style.backgroundColor = "#218838")}
      onMouseOut={(e) => (e.target.style.backgroundColor = "#28a745")}
    >
      {editingId ? "Update Expense" : "Add Expense"}
    </button>

    <h3 style={{ marginTop: "20px", color: "#333" }}>Expense List</h3>
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "10px",
        backgroundColor: "#fff",
        borderRadius: "5px",
        overflow: "hidden",
      }}
    >
      <thead>
        <tr style={{ backgroundColor: "#f0f0f0", textAlign: "left" }}>
          <th style={{ width: "50%", padding: "10px", borderBottom: "2px solid #ccc" }}>Expense Name</th>
          <th style={{ width: "15%", padding: "10px", borderBottom: "2px solid #ccc" }}>Price</th>
          <th style={{ width: "15%", padding: "10px", borderBottom: "2px solid #ccc" }}>Date</th>
          <th style={{ width: "20%", padding: "10px", borderBottom: "2px solid #ccc" }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {expenses.map((exp) => (
          <tr key={exp.id} style={{ borderBottom: "1px solid #ddd" }}>
            <td style={{ padding: "10px", maxWidth: "50%" }}>
              <div
                style={{
                  wordBreak: "break-word",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: expandedRows[exp.id] ? "unset" : 4,
                }}
              >
                {exp.name}
              </div>
              {exp.name.length > 100 && (
                <button
                  onClick={() => toggleReadMore(exp.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#007bff",
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "underline",
                    fontSize: "12px",
                  }}
                >
                  {expandedRows[exp.id] ? "Read Less" : "Read More"}
                </button>
              )}
            </td>
            <td style={{ padding: "10px" }}>${exp.price}</td>
            <td style={{ padding: "10px" }}>
              {exp.date ? new Date(exp.date).toLocaleDateString() : "No Date"}
            </td>
            <td style={{ padding: "10px" }}>
              <button
                onClick={() => {
                  setExpense({ name: exp.name, price: exp.price });
                  setEditingId(exp.id);
                }}
                style={{
                  padding: "5px 10px",
                  border: "none",
                  borderRadius: "5px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  cursor: "pointer",
                  transition: "background 0.3s",
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "#0056b3")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "#007bff")}
              >
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
    
  );
};
