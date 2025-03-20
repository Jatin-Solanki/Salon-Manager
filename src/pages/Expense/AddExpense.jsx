// export const Expense=()=>{
//     return(
//         <>
//             <h1>ADD Expense</h1>
//         </>
//     )
// }

import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { collection, addDoc, onSnapshot, query, where, getDocs, Timestamp } from "firebase/firestore";

export const Expense = () => {
  const [expense, setExpense] = useState({ name: "", price: "" });
  const [expenses, setExpenses] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "expenses"), (snapshot) => {
      setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const addExpense = async () => {
    if (!expense.name || !expense.price) return;
    try {
      await addDoc(collection(db, "expenses"), {
        name: expense.name,
        price: parseFloat(expense.price),
        date: Timestamp.now()
      });
      setExpense({ name: "", price: "" });
    } catch (error) {
      console.error("Error adding expense: ", error);
    }
  };

  const fetchTotalExpense = async () => {
    if (!startDate || !endDate) return;
    const start = Timestamp.fromDate(new Date(startDate + "T00:00:00"));
    const end = Timestamp.fromDate(new Date(endDate + "T23:59:59"));
    
    try {
      const q = query(collection(db, "expenses"), where("date", ">=", start), where("date", "<=", end));
      const querySnapshot = await getDocs(q);
      let total = 0;
      querySnapshot.forEach(doc => {
        const price = doc.data().price;
        if (!isNaN(price)) {
          total += parseFloat(price);
        }
      });
      setTotalExpense(total);
    } catch (error) {
      console.error("Error fetching total expense: ", error);
    }
  };

  return (
    <div style={{ padding: "16px", border: "1px solid #ccc", borderRadius: "8px", maxWidth: "400px", margin: "auto" }}>
    <h2 style={{ fontSize: "18px", fontWeight: "600" }}>Add Expense</h2>
    <input
      type="text"
      placeholder="Expense Name"
      style={{ border: "1px solid #ccc", padding: "8px", margin: "4px", display: "block", width: "95%" }}
      value={expense.name}
      onChange={(e) => setExpense({ ...expense, name: e.target.value })}
    />
    <input
      type="number"
      placeholder="Price"
      style={{ border: "1px solid #ccc", padding: "8px", margin: "4px", display: "block", width: "95%" }}
      value={expense.price}
      onChange={(e) => setExpense({ ...expense, price: e.target.value })}
    />
    <button 
      style={{ backgroundColor: "#3b82f6", color: "white", padding: "8px", borderRadius: "4px", border: "none", margin: "4px", width: "100%" , cursor:"pointer" }}
      onClick={addExpense}
    >
      Add Expense
    </button>
  
    <h3 style={{ fontSize: "16px", fontWeight: "600", marginTop: "16px" }}>Fetch Total Expense</h3>
    <input 
      type="date" 
      style={{ border: "1px solid #ccc", padding: "8px", margin: "4px", display: "block", width: "95%" }}
      value={startDate} 
      onChange={(e) => setStartDate(e.target.value)} 
    />
    <input 
      type="date" 
      style={{ border: "1px solid #ccc", padding: "8px", margin: "4px", display: "block", width: "95%" }}
      value={endDate} 
      onChange={(e) => setEndDate(e.target.value)} 
    />
    <button 
      style={{ backgroundColor: "#facc15", color: "white", padding: "8px", borderRadius: "4px", border: "none", margin: "4px", width: "100%", cursor:"pointer" }}
      onClick={fetchTotalExpense}
    >
      Get Total Expense
    </button>
    <h4 style={{ fontSize: "16px", fontWeight: "600", marginTop: "8px" }}>Total Expense: ${totalExpense.toFixed(2)}</h4>
  
    <h3 style={{ fontSize: "16px", fontWeight: "600", marginTop: "16px" }}>Expense List</h3>
    <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ddd", padding: "8px" }}>
      <ul style={{ listStyle: "none", padding: "0" }}>
        {expenses.length > 0 ? (
          expenses.map((exp) => (
            <li 
              key={exp.id} 
              style={{ borderBottom: "1px solid #ccc", padding: "8px", marginBottom: "4px" }}
            >
              {exp.name} - ${exp.price} - {exp.date ? new Date(exp.date.toDate()).toLocaleDateString() : "No Date"}
            </li>
          ))
        ) : (
          <p>No expenses found.</p>
        )}
      </ul>
    </div>
  </div>
  
  );
};
