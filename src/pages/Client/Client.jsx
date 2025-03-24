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
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="customer-table-container" style={{display:"flex" , alignItems:"center", justifyContent:"center"}}>
      <h2>Customer List</h2>
      <table className="customer-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer, index) => (
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



