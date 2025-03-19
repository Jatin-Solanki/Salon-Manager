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

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-lg font-semibold">Sales Report</h2>
      <input type="date" className="border p-2 m-1" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      <input type="date" className="border p-2 m-1" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      <button className="bg-blue-500 text-white p-2 m-2 rounded" onClick={fetchSales}>Fetch Sales</button>
      
      <div className="mt-4 font-bold">
        Total Sales: <span className="text-blue-600">${totalFilteredSales.toFixed(2)}</span>
      </div>
      
      <div className="mt-4 border p-4 rounded">
        <h3 className="font-semibold">Sales per Service</h3>
        {Object.keys(serviceSales).length > 0 ? (
          <ul className="list-disc pl-5">
            {Object.entries(serviceSales).map(([service, total]) => (
              <li key={service}>{service || "Unknown"}: ${total.toFixed(2)}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No sales data available.</p>
        )}
      </div>
      
      <div className="mt-4 border p-4 rounded">
        <h3 className="font-semibold">Sales per Service (Pie Chart)</h3>
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
          <p className="text-gray-500">No data available for visualization.</p>
        )}
      </div>


      
      <div className="mt-4 border p-4 rounded">
        <h3 className="font-semibold">Total Sales per Barber</h3>
        {Object.keys(barberSales).length > 0 ? (
          <ul className="list-disc pl-5">
            {Object.entries(barberSales).map(([barberId, total]) => (
              <li key={barberId}>{barbers.find(b => b.id === barberId)?.name || "Unknown"}: ${total.toFixed(2)}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No sales data available.</p>
        )}
      </div>
      
        {/* table */}
      <div className="mt-4 border p-4 rounded">
        <h3 className="font-semibold">Sales Table</h3>
        <table className="w-full border-collapse border border-gray-300 mt-2">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Date</th>
              <th className="border p-2">Barber</th>
              <th className="border p-2">Services</th>
              <th className="border p-2">Payment Mode</th>
              <th className="border p-2">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {sales.length > 0 ? (
              sales.map(sale => (
                <tr key={sale.id} className="border">
                  <td className="border p-2">{sale.date?.toDate().toLocaleDateString()}</td>
                  <td className="border p-2">{barbers.find(b => b.id === sale.barberId)?.name || "Unknown"}</td>
                  <td className="border p-2">{sale.services?.map(s => s.name).join(", ") || "N/A"}</td>
                  <td className="border p-2">{sale.paymentMode}</td>
                  <td className="border p-2">${sale.total?.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center p-2">No sales data available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
