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
    <div style={{ padding: "20px", border: "2px solid #ccc", borderRadius: "10px", maxWidth: "600px", margin: "20px auto", backgroundColor: "#f9f9f9" }}>
      <h2 style={{ textAlign: "center", color: "#333" }}>Add / Edit Expense</h2>
      <input style={{ width: "95%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc" }} type="text" placeholder="Expense Name" value={expense.name} onChange={(e) => setExpense({ ...expense, name: e.target.value })} />
      <input style={{ width: "95%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc" }} type="number" placeholder="Price" value={expense.price} onChange={(e) => setExpense({ ...expense, price: e.target.value })} />
      <input style={{ width: "95%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc" }} type="text" placeholder="Owner" value={owner} onChange={(e) => setOwner(e.target.value)} />
      <button style={{ width: "100%", padding: "10px", backgroundColor: "#4CAF50", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }} onClick={addOrUpdateExpense}>{editingId ? "Update Expense" : "Add Expense"}</button>

      <h3 style={{ marginTop: "20px", color: "#333" }}>Filter Expenses</h3>
      <input style={{ width: "48%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc" }} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      <input style={{ width: "48%", padding: "10px", marginBottom: "10px", borderRadius: "5px", border: "1px solid #ccc" }} type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      <button style={{ width: "100%", padding: "10px", backgroundColor: "#2196F3", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }} onClick={fetchFilteredExpenses}>Fetch Expenses</button>
      
      <h3 style={{ marginTop: "20px", color: "#333" }}>Expense List</h3>
      <ul style={{ listStyle: "none", padding: "0" , maxHeight:"180px" ,overflowY:"auto" }}>
        {expenses.map(exp => (
          <li key={exp.id} style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
            {exp.name} - ${exp.price} - {exp.date ? new Date(exp.date.toDate()).toLocaleDateString() : "No Date"} 
            <button style={{ marginLeft: "10px", backgroundColor: "#f44336", color: "white", border: "none", padding: "5px", borderRadius: "5px", cursor: "pointer" }} onClick={() => { setExpense({ name: exp.name, price: exp.price }); setEditingId(exp.id); }}>Edit</button>
          </li>
        ))}
      </ul>
    </div>
  );
};
