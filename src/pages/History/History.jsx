import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export const History = () => {
  const [sales, setSales] = useState([]);
  const [barbers, setBarbers] = useState([]);
  
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

  const formatServices = (services) => {
    if (!services) return "N/A";
    const serviceCount = {};
    services.forEach(service => {
      serviceCount[service.name] = (serviceCount[service.name] || 0) + 1;
    });
    return Object.entries(serviceCount)
      .map(([name, count]) => (count > 1 ? `${name} x${count}` : name))
      .join(", ");
  };

  return (
<div style={{ padding: "16px", maxWidth: "64rem", margin: "0 auto" , position:"absolute", right:"100px"}}>
    <h2 style={{ fontSize: "1.5rem", fontWeight: "600" }}>History</h2>

    <div style={{ marginTop: "16px", border: "1px solid #ccc", padding: "16px", borderRadius: "8px" }}>
        <h3 style={{ fontWeight: "600" }}>Latest Sales Table</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ccc", marginTop: "8px" }}>
            <thead>
                <tr style={{ backgroundColor: "#E5E7EB" }}>
                    <th style={{ border: "1px solid #ccc", padding: "12px", minWidth: "120px" }}>Date</th>
                    <th style={{ border: "1px solid #ccc", padding: "12px", minWidth: "140px" }}>Barber</th>
                    <th style={{ border: "1px solid #ccc", padding: "12px", minWidth: "180px" }}>Services</th>
                    <th style={{ border: "1px solid #ccc", padding: "12px", minWidth: "140px" }}>Payment Mode</th>
                    <th style={{ border: "1px solid #ccc", padding: "12px", minWidth: "120px" }}>Total Amount</th>
                </tr>
            </thead>
            <tbody>
                {sales.length > 0 ? (
                    sales.map(sale => (
                        <tr key={sale.id} style={{ border: "1px solid #ccc" }}>
                            <td style={{ border: "1px solid #ccc", padding: "12px" }}>{sale.date?.toDate().toLocaleDateString()}</td>
                            <td style={{ border: "1px solid #ccc", padding: "12px" }}>
                                {barbers.find(b => b.id === sale.barberId)?.name || "Unknown"}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "12px" }}>
                                {formatServices(sale.services)}
                            </td>
                            <td style={{ border: "1px solid #ccc", padding: "12px" }}>{sale.paymentMode}</td>
                            <td style={{ border: "1px solid #ccc", padding: "12px", fontWeight: "bold", color: "#007bff" }}>
                                ${sale.total?.toFixed(2)}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="5" style={{ textAlign: "center", padding: "12px" }}>No recent sales data available.</td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
</div>

  );
};
