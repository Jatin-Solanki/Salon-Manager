import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs, doc, updateDoc, Timestamp } from "firebase/firestore";

export const EditHistory = () => {
  const [sales, setSales] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [editingSale, setEditingSale] = useState(null);
  const [formData, setFormData] = useState({ date: "", barberId: "", services: "", paymentMode: "", total: "" });

  useEffect(() => {
    const fetchBarbers = async () => {
      try {
        const snapshot = await getDocs(collection(db, "barbers"));
        setBarbers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Error fetching barbers: ", error);
      }
    };
    fetchBarbers();
  }, []);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const salesRef = collection(db, "sales");
        const snapshot = await getDocs(salesRef);
        const salesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        salesData.sort((a, b) => b.date.toDate() - a.date.toDate());
        const latestDates = [...new Set(salesData.map(sale => sale.date.toDate().toLocaleDateString()))].slice(0, 2);
        const filteredSales = salesData.filter(sale => latestDates.includes(sale.date.toDate().toLocaleDateString()));
        
        setSales(filteredSales);
      } catch (error) {
        console.error("Error fetching sales: ", error);
      }
    };
    fetchSales();
  }, []);

  const handleEditClick = (sale) => {
    setEditingSale(sale);
    setFormData({
      date: sale.date.toDate().toISOString().split("T")[0], // Convert Firestore timestamp to YYYY-MM-DD
      barberId: sale.barberId,
      services: sale.services.map(s => s.name).join(", "), // Convert array to comma-separated string
      paymentMode: sale.paymentMode,
      total: sale.total.toString(), // Convert number to string for input field
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "services" ? value : value,
    }));
  };

  const handleSave = async () => {
    if (editingSale) {
      try {
        const saleRef = doc(db, "sales", editingSale.id);
        await updateDoc(saleRef, {
          date: Timestamp.fromDate(new Date(formData.date)), // Convert back to Firestore Timestamp
          barberId: formData.barberId,
          services: formData.services.split(",").map(name => ({ name: name.trim() })), // Convert string back to array
          paymentMode: formData.paymentMode,
          total: parseFloat(formData.total), // Convert back to number
        });

        // Update state instead of reloading the page
        setSales(sales.map(sale => (sale.id === editingSale.id ? { ...sale, ...formData, date: Timestamp.fromDate(new Date(formData.date)) } : sale)));

        setEditingSale(null);
      } catch (error) {
        console.error("Error updating sale: ", error);
      }
    }
  };

  return (
    <div style={{
      position: "absolute",
      right: "40px",
      // padding: "16px",
      maxWidth: "45rem",
      margin: "0 auto",
      fontFamily: "Arial, sans-serif",
      // backgroundColor: "#f9f9f9",
      // borderRadius: "8px"
    }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: "#333" }}>History</h2>

      <div style={{
        marginTop: "16px",
        border: "1px solid #ccc",
        padding: "16px",
        borderRadius: "8px",
        backgroundColor: "#fff",
        boxShadow: "0px 2px 5px rgba(0,0,0,0.1)"
      }}>
        <h3 style={{ fontWeight: "600", marginBottom: "8px", color: "#555" }}>Latest Sales Table</h3>
        <table style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #ccc",
          marginTop: "8px",
          backgroundColor: "#fff"
        }}>
          <thead>
            <tr style={{ backgroundColor: "#E5E7EB", textAlign: "left" }}>
              <th style={{ padding: "6px", borderBottom: "2px solid #ccc", minWidth: "60px" }}>Date</th>
              <th style={{ padding: "6px", borderBottom: "2px solid #ccc", minWidth: "70px" }}>Barber</th>
              <th style={{ padding: "6px", borderBottom: "2px solid #ccc", minWidth: "80px" }}>Services</th>
              <th style={{ padding: "6px", borderBottom: "2px solid #ccc", minWidth: "60px" }}>Payment</th>
              <th style={{ padding: "6px", borderBottom: "2px solid #ccc", minWidth: "60px" }}>Total</th>
              <th style={{ padding: "6px", borderBottom: "2px solid #ccc", minWidth: "70px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sales.length > 0 ? (
              sales.map(sale => (
                <tr key={sale.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "6px" }}>{sale.date?.toDate().toLocaleDateString()}</td>
                  <td style={{ padding: "6px" }}>{barbers.find(b => b.id === sale.barberId)?.name || "Unknown"}</td>
                  <td style={{ padding: "6px" }}>{sale.services.map(s => s.name).join(", ")}</td>
                  <td style={{ padding: "6px" }}>{sale.paymentMode}</td>
                  <td style={{ padding: "6px", fontWeight: "bold", color: "#007bff" }}>Rs.{sale.total?.toFixed(2)}</td>
                  <td style={{ padding: "6px" }}>
                    <button
                      onClick={() => handleEditClick(sale)}
                      style={{
                        padding: "4px 8px",
                        border: "none",
                        backgroundColor: "#007bff",
                        color: "white",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.75rem"
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "6px", color: "#666" }}>No recent sales data available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingSale && (
  <div style={{ 
    marginTop: "20px", 
    padding: "16px", 
    backgroundColor: "#fff", 
    borderRadius: "8px", 
    boxShadow: "0px 2px 5px rgba(0,0,0,0.1)", 
    maxWidth: "400px", 
    margin: "auto" 
  }}>
    <h3 style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "12px", color: "#333" }}>
      Edit Sale
    </h3>

    <label style={{ display: "block", fontWeight: "500", marginBottom: "4px", color: "#555" }}>Date:</label>
    <input 
      type="date" 
      name="date" 
      value={formData.date} 
      onChange={handleChange} 
      style={{ 
        width: "100%", 
        padding: "8px", 
        marginBottom: "10px", 
        borderRadius: "6px", 
        border: "1px solid #ccc" 
      }}
    />

    <label style={{ display: "block", fontWeight: "500", marginBottom: "4px", color: "#555" }}>Services:</label>
    <input 
      type="text" 
      name="services" 
      value={formData.services} 
      onChange={handleChange} 
      placeholder="Services (comma separated)" 
      style={{ 
        width: "100%", 
        padding: "8px", 
        marginBottom: "10px", 
        borderRadius: "6px", 
        border: "1px solid #ccc" 
      }}
    />

    <label style={{ display: "block", fontWeight: "500", marginBottom: "4px", color: "#555" }}>Payment Mode:</label>
    <input 
      type="text" 
      name="paymentMode" 
      value={formData.paymentMode} 
      onChange={handleChange} 
      style={{ 
        width: "100%", 
        padding: "8px", 
        marginBottom: "10px", 
        borderRadius: "6px", 
        border: "1px solid #ccc" 
      }}
    />

    <label style={{ display: "block", fontWeight: "500", marginBottom: "4px", color: "#555" }}>Total:</label>
    <input 
      type="number" 
      name="total" 
      value={formData.total} 
      onChange={handleChange} 
      style={{ 
        width: "100%", 
        padding: "8px", 
        marginBottom: "10px", 
        borderRadius: "6px", 
        border: "1px solid #ccc" 
      }}
    />

    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
      <button 
        onClick={handleSave} 
        style={{ 
          backgroundColor: "#28a745", 
          color: "white", 
          border: "none", 
          padding: "8px 12px", 
          borderRadius: "6px", 
          cursor: "pointer", 
          fontSize: "0.9rem" 
        }}>
        Save
      </button>

      <button 
        onClick={() => setEditingSale(null)} 
        style={{ 
          backgroundColor: "#dc3545", 
          color: "white", 
          border: "none", 
          padding: "8px 12px", 
          borderRadius: "6px", 
          cursor: "pointer", 
          fontSize: "0.9rem" 
        }}>
        Cancel
      </button>
    </div>
  </div>
      )}
    </div>
  );
};
