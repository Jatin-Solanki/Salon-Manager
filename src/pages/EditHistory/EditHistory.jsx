import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

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
      date: sale.date.toDate().toISOString().split('T')[0],
      barberId: sale.barberId,
      services: sale.services.map(s => s.name).join(", "),
      paymentMode: sale.paymentMode,
      total: sale.total,
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (editingSale) {
      try {
        const saleRef = doc(db, "sales", editingSale.id);
        await updateDoc(saleRef, {
          date: new Date(formData.date),
          barberId: formData.barberId,
          services: formData.services.split(", ").map(name => ({ name })),
          paymentMode: formData.paymentMode,
          total: parseFloat(formData.total),
        });
        setEditingSale(null);
        window.location.reload();
      } catch (error) {
        console.error("Error updating sale: ", error);
      }
    }
  };

  return (
    <div style={{ 
        padding: "16px", 
        maxWidth: "32rem", 
        margin: "0 auto", 
        fontFamily: "Arial, sans-serif", 
        backgroundColor: "#f9f9f9",
        borderRadius: "8px"
      }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: "600", color: "#333" }}>History</h2>
      
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
                <th style={{ padding: "8px", borderBottom: "2px solid #ccc" }}>Date</th>
                <th style={{ padding: "8px", borderBottom: "2px solid #ccc" }}>Barber</th>
                <th style={{ padding: "8px", borderBottom: "2px solid #ccc" }}>Services</th>
                <th style={{ padding: "8px", borderBottom: "2px solid #ccc" }}>Payment Mode</th>
                <th style={{ padding: "8px", borderBottom: "2px solid #ccc" }}>Total Amount</th>
                <th style={{ padding: "8px", borderBottom: "2px solid #ccc" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sales.length > 0 ? (
                sales.map(sale => (
                  <tr key={sale.id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={{ padding: "8px" }}>{sale.date?.toDate().toLocaleDateString()}</td>
                    <td style={{ padding: "8px" }}>{barbers.find(b => b.id === sale.barberId)?.name || "Unknown"}</td>
                    <td style={{ padding: "8px" }}>{sale.services.map(s => s.name).join(", ")}</td>
                    <td style={{ padding: "8px" }}>{sale.paymentMode}</td>
                    <td style={{ padding: "8px", fontWeight: "bold", color: "#007bff" }}>${sale.total?.toFixed(2)}</td>
                    <td style={{ padding: "8px" }}>
                      <button 
                        onClick={() => handleEditClick(sale)} 
                        style={{ 
                          padding: "6px 12px", 
                          border: "none", 
                          backgroundColor: "#007bff", 
                          color: "white", 
                          borderRadius: "4px", 
                          cursor: "pointer" 
                        }}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "12px", color: "#666" }}>No recent sales data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      
        {editingSale && (
          <div style={{ 
            marginTop: "16px", 
            padding: "16px", 
            border: "1px solid #ccc", 
            borderRadius: "8px", 
            backgroundColor: "#fff", 
            boxShadow: "0px 2px 5px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{ marginBottom: "8px", color: "#555" }}>Edit Sale</h3>
            <input 
              type="date" 
              name="date" 
              value={formData.date} 
              onChange={handleChange} 
              style={{ width: "100%", padding: "8px", marginBottom: "8px", border: "1px solid #ccc", borderRadius: "4px" }} 
            />
            <select 
              name="barberId" 
              value={formData.barberId} 
              onChange={handleChange} 
              style={{ width: "100%", padding: "8px", marginBottom: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            >
              {barbers.map(barber => (
                <option key={barber.id} value={barber.id}>{barber.name}</option>
              ))}
            </select>
            <input 
              type="text" 
              name="services" 
              value={formData.services} 
              onChange={handleChange} 
              placeholder="Services (comma-separated)" 
              style={{ width: "100%", padding: "8px", marginBottom: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
            <input 
              type="text" 
              name="paymentMode" 
              value={formData.paymentMode} 
              onChange={handleChange} 
              placeholder="Payment Mode" 
              style={{ width: "100%", padding: "8px", marginBottom: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
            <input 
              type="number" 
              name="total" 
              value={formData.total} 
              onChange={handleChange} 
              placeholder="Total Amount" 
              style={{ width: "100%", padding: "8px", marginBottom: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
            <button 
              onClick={handleSave} 
              style={{ 
                padding: "8px 16px", 
                backgroundColor: "#28a745", 
                color: "white", 
                border: "none", 
                borderRadius: "4px", 
                cursor: "pointer",
                marginRight: "8px"
              }}
            >
              Save
            </button>
            <button 
              onClick={() => setEditingSale(null)} 
              style={{ 
                padding: "8px 16px", 
                backgroundColor: "#dc3545", 
                color: "white", 
                border: "none", 
                borderRadius: "4px", 
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      
  );
};
