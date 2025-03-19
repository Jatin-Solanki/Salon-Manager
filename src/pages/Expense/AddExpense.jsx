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
    <div className="expense-container">
      <h2>Add Expense</h2>
      <input
        type="text"
        placeholder="Expense Name"
        value={expense.name}
        onChange={(e) => setExpense({ ...expense, name: e.target.value })}
      />
      <input
        type="number"
        placeholder="Price"
        value={expense.price}
        onChange={(e) => setExpense({ ...expense, price: e.target.value })}
      />
      <button onClick={addExpense}>Add Expense</button>

      <h3>Fetch Total Expense</h3>
      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      <button onClick={fetchTotalExpense}>Get Total Expense</button>
      <h4>Total Expense: ${totalExpense.toFixed(2)}</h4>

      <h3>Expense List</h3>
      <ul>
        {expenses.map((exp) => (
          <li key={exp.id}>{exp.name} - ${exp.price} - {exp.date ? new Date(exp.date.toDate()).toLocaleDateString() : "No Date"}</li>
        ))}
      </ul>
    </div>
  );
};
