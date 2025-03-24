// export const Client=()=>{
//     return(
//         <>
//             <div style={{textAlign:"center"}}>
//                 <h1>Hello</h1>
//             </div>
//         </>
//     )
// }

import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import "./Client.css";

export const Client = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "sales"), (snapshot) => {
      const customerData = snapshot.docs.map((doc) => ({
        name: doc.data().customerName,
        phone: doc.data().customerPhone,
      }));

      // Remove duplicate phone numbers
      const uniqueCustomers = Array.from(
        new Map(customerData.map((item) => [item.phone, item])).values()
      );

      setCustomers(uniqueCustomers);
      setFilteredCustomers(uniqueCustomers);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const filtered = customers.filter((customer) =>
      customer.phone.includes(searchTerm)
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  return (
    <div className="customer-table-container" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h2>Customer List</h2>
      <input
        type="text"
        placeholder="Search by phone number"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <table className="customer-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.map((customer, index) => (
            <tr key={index}>
              <td>{customer.name}</td>
              <td>{customer.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};




