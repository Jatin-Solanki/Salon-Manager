import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { collection, onSnapshot } from "firebase/firestore";
import "./Client.css";

export const Client = () => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState(null);

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

  const sendMessages = async (type) => {
    const numbers = filteredCustomers.map((customer) => customer.phone);
    const formData = new FormData();
    formData.append("message", message);
    formData.append("numbers", JSON.stringify(numbers));
    if (photo) {
      formData.append("photo", photo);
    }

    try {
      const response = await fetch(`/api/send-${type}`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error("Error sending messages:", error);
      alert("Failed to send messages");
    }
  };

  return (
    <div className="customer-table-container" style={{ display: "flex", flexDirection: "column", position:"absolute", right:"350px" }}>
      <h2>Customer List</h2>
      <input
        type="text"
        placeholder="Search by phone number"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
    <div style={{maxHeight:"500px", overflowY:"auto", maxWidth:"800px"}}>
      <table className="customer-table">
        <thead>
          <tr>
            <th>S.No.</th>
            <th>Name</th>
            <th>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.map((customer, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{customer.name}</td>
              <td>{customer.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
      <textarea
        placeholder="Enter message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="message-input"
      />
      <input 
        type="file" 
        accept="image/*" 
        onChange={(e) => setPhoto(e.target.files[0])} 
        className="file-input"
      />
      <button onClick={() => sendMessages("sms")} className="send-button">Send SMS</button>
      <button onClick={() => sendMessages("whatsapp")} className="send-button">Send WhatsApp</button>
    </div>
  );
};
