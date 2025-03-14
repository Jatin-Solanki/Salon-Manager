// import './publication.css'
// export const Publication=()=>{
//     return(
//         <>
//         <div className="publication">
//             <h1>Check Sells</h1>
//         </div>
//         </>
//     )
// }

import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";

export const Publication = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBarber, setSelectedBarber] = useState("all");
  const [selectedPaymentMode, setSelectedPaymentMode] = useState("all");
  const [sales, setSales] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [totalFilteredSales, setTotalFilteredSales] = useState(0);
  const [barberSales, setBarberSales] = useState({});

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
      salesData.forEach(sale => {
        if (!barberSalesMap[sale.barberId]) {
          barberSalesMap[sale.barberId] = 0;
        }
        barberSalesMap[sale.barberId] += sale.total || 0;
      });
      setBarberSales(barberSalesMap);
    } catch (error) {
      console.error("Error fetching sales: ", error);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-lg font-semibold">Sales Report</h2>
      <input type="date" className="border p-2 m-1" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      <input type="date" className="border p-2 m-1" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      {/* <select className="border p-2 m-1" value={selectedBarber} onChange={(e) => setSelectedBarber(e.target.value)}>
        <option value="all">All Barbers</option>
        {barbers.map((barber) => (<option key={barber.id} value={barber.id}>{barber.name}</option>))}
      </select>
      <select className="border p-2 m-1" value={selectedPaymentMode} onChange={(e) => setSelectedPaymentMode(e.target.value)}>
        <option value="all">Both Payment Modes</option>
        <option value="cash">Cash</option>
        <option value="online">Online</option>
      </select> */}
      <button className="bg-blue-500 text-white p-2 m-2 rounded" onClick={fetchSales}>Fetch Sales</button>
      <div className="mt-4 font-bold">
        Total Sales {selectedBarber !== "all" ? ` for Barber: ${barbers.find(b => b.id === selectedBarber)?.name || "Unknown"}` : " (All Barbers)"},
        {selectedPaymentMode !== "all" ? ` Payment Mode: ${selectedPaymentMode}` : " (All Modes)"}:  
        <span className="text-blue-600"> ${totalFilteredSales.toFixed(2)}</span>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold">Sales Records</h3>
        {sales.length > 0 ? (
          <table className="w-full border mt-2">
            <thead>
              <tr className="border-b">
                <th className="p-2">Date</th>
                <th className="p-2">Barber</th>
                <th className="p-2">Service</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Payment Mode</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-b">
                  <td className="p-2">{sale.date.toDate().toLocaleDateString()}</td>
                  <td className="p-2">{barbers.find(b => b.id === sale.barberId)?.name || "Unknown"}</td>
                  <td className="p-2">{sale.service || "N/A"}</td>
                  <td className="p-2">${sale.total.toFixed(2)}</td>
                  <td className="p-2">{sale.paymentMode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No sales found for the selected filters.</p>
        )}
      </div>
      <div className="mt-4">
        <h3 className="font-semibold">Sales per Barber</h3>
        {Object.keys(barberSales).length > 0 ? (
          <ul className="list-disc pl-5">
            {Object.entries(barberSales).map(([barberId, total]) => (
              <li key={barberId}>
                {barbers.find(b => b.id === barberId)?.name || "Unknown"}: ${total.toFixed(2)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No sales data available for the selected date range.</p>
        )}
      </div>
    </div>
  );
};
