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
  const [totalCashPayment, setTotalCashPayment] = useState(0);
  const [totalOnlinePayment, setTotalOnlinePayment] = useState(0);

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

      let cashTotal = 0;
      let onlineTotal = 0;

      salesData.forEach(sale => {
        const paymentMode = sale.paymentMode ? sale.paymentMode.toLowerCase() : "";
        const saleTotal = Number(sale.total) || 0;
  
        if (paymentMode === "cash") cashTotal += saleTotal;
        if (paymentMode === "online") onlineTotal += saleTotal;
      });
      setTotalCashPayment(cashTotal);
      setTotalOnlinePayment(onlineTotal);

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
      console.log("Total Cash Payment:", cashTotal);
      console.log("Total Online Payment:", onlineTotal);
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
<div style={{ padding: "16px", maxWidth: "32rem", margin: "0 auto" , position:"absolute" ,right:"180px" , top:"70px" }}>
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
    Total Sales: <span style={{ color: "#2563EB" }}>Rs.{totalFilteredSales.toFixed(2)}</span>
  </div>

      <div style={{ marginTop: "16px", fontWeight: "bold" }}>
        Total Cash Payments: <span style={{ color: "#10B981" }}>Rs.{totalCashPayment.toFixed(2)}</span>
      </div>
      <div style={{ marginTop: "16px", fontWeight: "bold" }}>
        Total Online Payments: <span style={{ color: "#F59E0B" }}>Rs.{totalOnlinePayment.toFixed(2)}</span>
      </div>

  <div style={{ marginTop: "16px", border: "1px solid #ccc", padding: "16px", borderRadius: "8px" }}>
    <h3 style={{ fontWeight: "600" }}>Sales per Service</h3>
    {Object.keys(serviceSales).length > 0 ? (
      <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
        {Object.entries(serviceSales).map(([service, total]) => (
          <li key={service}>{service || "Unknown"}: Rs.{total.toFixed(2)}</li>
        ))}
      </ul>
    ) : (
      <p style={{ color: "#6B7280" }}>No sales data available.</p>
    )}
  </div>

  <div style={{ marginTop: "16px", border: "1px solid #ccc", padding: "16px", borderRadius: "8px" }}>
    <h3 style={{ fontWeight: "600" }}>Sales per Service (Pie Chart)</h3>
    {pieData.length > 0 ? (
      <PieChart width={450} height={600}>
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
          <li key={barberId}>{barbers.find(b => b.id === barberId)?.name || "Unknown"}: Rs.{total.toFixed(2)}</li>
        ))}
      </ul>
    ) : (
      <p style={{ color: "#6B7280" }}>No sales data available.</p>
    )}
  </div>

  {/* Sales Table */}
  
  <div>
  <h3 style={{ fontWeight: "600", marginBottom: "8px", color: "#555" }}>Sales Table</h3>
  
  <table style={{ width: "0%", borderCollapse: "collapse", border: "1px solid #ccc", marginTop: "8px", backgroundColor: "#fff" }}>
    <thead>
      <tr style={{ backgroundColor: "#E5E7EB", textAlign: "left" }}>
        <th style={{ padding: "5px", borderBottom: "2px solid #ccc", minWidth: "80px" }}>Date</th>
        <th style={{ padding: "5px", borderBottom: "2px solid #ccc", minWidth: "100px" }}>Barber</th>
        <th style={{ padding: "5px", borderBottom: "2px solid #ccc", minWidth: "150px" }}>Services</th>
        <th style={{ padding: "5px", borderBottom: "2px solid #ccc", minWidth: "100px" }}>Payment Mode</th>
        <th style={{ padding: "5px", borderBottom: "2px solid #ccc", minWidth: "100px" }}>Total Amount</th>
      </tr>
    </thead>
    <tbody>
      {sales.length > 0 ? (
        sales.map(sale => (
          <tr key={sale.id} style={{ borderBottom: "1px solid #ddd" }}>
            <td style={{ padding: "8px" }}>{sale.date?.toDate().toLocaleDateString()}</td>
            <td style={{ padding: "8px" }}>{barbers.find(b => b.id === sale.barberId)?.name || "Unknown"}</td>
            <td style={{ padding: "8px" }}>{sale.services ? formatServices(sale.services) : "N/A"}</td>
            <td style={{ padding: "8px" }}>{sale.paymentMode}</td>
            <td style={{ padding: "8px", fontWeight: "bold", color: "#007bff" }}>Rs.{sale.total?.toFixed(2)}</td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan="5" style={{ textAlign: "center", padding: "10px", color: "#666" }}>No sales data available.</td>
        </tr>
      )}
    </tbody>
  </table>
</div>


</div>

  );
};
