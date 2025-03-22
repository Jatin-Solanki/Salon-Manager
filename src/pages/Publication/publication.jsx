import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

export const Publication = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBarber, setSelectedBarber] = useState("all");
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("all");
  const [sales, setSales] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [totalFilteredSales, setTotalFilteredSales] = useState(0);
  const [barberSales, setBarberSales] = useState({});
  const [serviceSales, setServiceSales] = useState({});


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

  const fetchSales = async () => {
    try {
      let salesRef = collection(db, "sales");
      let conditions = [];

      if (startDate) conditions.push(where("date", ">=", Timestamp.fromDate(new Date(`${startDate}T00:00:00`))));
      if (endDate) conditions.push(where("date", "<=", Timestamp.fromDate(new Date(`${endDate}T23:59:59`))));
      if (selectedBarber !== "all") conditions.push(where("barberId", "==", selectedBarber));
      if (selectedPaymentMode !== "all") conditions.push(where("paymentMode", "==", selectedPaymentMode));

      const salesQuery = query(salesRef, ...conditions);
      const snapshot = await getDocs(salesQuery);
      const salesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      setSales(salesData);
      const total = salesData.reduce((acc, sale) => acc + (sale.total || 0), 0);
      setTotalFilteredSales(total);

      // Calculate sales per barber
      const barberSalesMap = {};
      const serviceSalesMap = {};
      salesData.forEach(sale => {
        if (!barberSalesMap[sale.barberId]) barberSalesMap[sale.barberId] = 0;
        barberSalesMap[sale.barberId] += sale.total || 0;

        if (sale.services && Array.isArray(sale.services)) {
          sale.services.forEach(service => {
            if (!serviceSalesMap[service.name]) serviceSalesMap[service.name] = 0;
            serviceSalesMap[service.name] += service.price || 0;
          });
        }
      });
      setBarberSales(barberSalesMap);
      setServiceSales(serviceSalesMap);
    } catch (error) {
      console.error("Error fetching sales: ", error);
    }
  };

  const pieData = Object.entries(serviceSales).map(([service, total]) => ({
    name: service || "Unknown",
    value: total,
  }));

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a4de6c"];

  const formatServices = (services) => {
    const serviceCount = {};
    services.forEach(service => {
      serviceCount[service.name] = (serviceCount[service.name] || 0) + 1;
    });
    return Object.entries(serviceCount).map(([name, count]) => `${name} x${count}`).join(", ");
  };

  return (
<div style={{ padding: "16px", maxWidth: "32rem", margin: "0 auto" }}>
  <h2 style={{ fontSize: "1.125rem", fontWeight: "600" }}>Sales Report</h2>
  
  <input 
    type="date" 
    style={{ border: "1px solid #ccc", padding: "8px", margin: "4px" }} 
    value={startDate} 
    onChange={(e) => setStartDate(e.target.value)} 
  />
  
  <input 
    type="date" 
    style={{ border: "1px solid #ccc", padding: "8px", margin: "4px" }} 
    value={endDate} 
    onChange={(e) => setEndDate(e.target.value)} 
  />
  
  <button 
    style={{ backgroundColor: "#3B82F6", color: "white", padding: "8px", margin: "8px", borderRadius: "4px" }} 
    onClick={fetchSales}
  >
    Fetch Sales
  </button>

  <div style={{ marginTop: "16px", fontWeight: "bold" }}>
    Total Sales: <span style={{ color: "#2563EB" }}>${totalFilteredSales.toFixed(2)}</span>
  </div>

  <div style={{ marginTop: "16px", border: "1px solid #ccc", padding: "16px", borderRadius: "8px" }}>
    <h3 style={{ fontWeight: "600" }}>Sales per Service</h3>
    {Object.keys(serviceSales).length > 0 ? (
      <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
        {Object.entries(serviceSales).map(([service, total]) => (
          <li key={service}>{service || "Unknown"}: ${total.toFixed(2)}</li>
        ))}
      </ul>
    ) : (
      <p style={{ color: "#6B7280" }}>No sales data available.</p>
    )}
  </div>

  <div style={{ marginTop: "16px", border: "1px solid #ccc", padding: "16px", borderRadius: "8px" }}>
    <h3 style={{ fontWeight: "600" }}>Sales per Service (Pie Chart)</h3>
    {pieData.length > 0 ? (
      <PieChart width={400} height={300}>
        <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
          {pieData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    ) : (
      <p style={{ color: "#6B7280" }}>No data available for visualization.</p>
    )}
  </div>

  <div style={{ marginTop: "16px", border: "1px solid #ccc", padding: "16px", borderRadius: "8px" }}>
    <h3 style={{ fontWeight: "600" }}>Total Sales per Barber</h3>
    {Object.keys(barberSales).length > 0 ? (
      <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
        {Object.entries(barberSales).map(([barberId, total]) => (
          <li key={barberId}>{barbers.find(b => b.id === barberId)?.name || "Unknown"}: ${total.toFixed(2)}</li>
        ))}
      </ul>
    ) : (
      <p style={{ color: "#6B7280" }}>No sales data available.</p>
    )}
  </div>

  {/* Sales Table */}
  
  <div style={{ marginTop: "16px", border: "1px solid #ccc", padding: "16px", borderRadius: "8px" }}>
        <h3 style={{ fontWeight: "600" }}>Sales Table</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ccc", marginTop: "8px" }}>
          <thead>
            <tr style={{ backgroundColor: "#E5E7EB" }}>
              <th>Date</th>
              <th>Barber</th>
              <th>Services</th>
              <th>Payment Mode</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {sales.length > 0 ? (
              sales.map(sale => (
                <tr key={sale.id}>
                  <td>{sale.date?.toDate().toLocaleDateString()}</td>
                  <td>{barbers.find(b => b.id === sale.barberId)?.name || "Unknown"}</td>
                  <td>{sale.services ? formatServices(sale.services) : "N/A"}</td>
                  <td>{sale.paymentMode}</td>
                  <td>${sale.total?.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>No sales data available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

</div>

  );
};
