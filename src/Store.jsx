import React, { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import { collection, addDoc, onSnapshot, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import './Store.css';
import { LabPage } from "./pages/LabPage/labpage";

import {AboutPage} from "./pages/About/aboutpage"

import { IoPersonRemoveSharp } from "react-icons/io5";
import { FaUserEdit } from "react-icons/fa";
import { IoIosRemoveCircle } from "react-icons/io";
import { IoMdAddCircle } from "react-icons/io";
import { FaSearch } from "react-icons/fa";

export const StoreApp = () => {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [customer, setCustomer] = useState({ name: "", phone: "" ,barber: "" ,paymentMode:"" });
  const [discount, setDiscount] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [newItem, setNewItem] = useState({ name: "", price: "" });
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newBarber, setNewBarber] = useState({ name: "", phone_no: "" });
  const [editingBarber, setEditingBarber] = useState(null);
  const [barbers, setBarbers] = useState([]);
  const [payment,setPayment]=useState("Select Payment Mode");
  const [discountpercent,setDiscountPercent]=useState("Discount%");

  useEffect(() => {
    const unsubscribeItems = onSnapshot(collection(db, "items"), (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    const unsubscribeBarbers = onSnapshot(collection(db, "barbers"), (snapshot) => {
      setBarbers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    return () => {
      unsubscribeItems();
      unsubscribeBarbers();
    };
  }, []);

  const addItem = async () => {
    if (!newItem.name || !newItem.price) return;
    try {
      await addDoc(collection(db, "items"), {
        name: newItem.name,
        price: parseFloat(newItem.price)
      });
      setNewItem({ name: "", price: "" });
    } catch (error) {
      console.error("Error adding item: ", error);
    }
  };
  
  const addBarber = async () => {
    if (!newBarber.name || !newBarber.phone_no) return;
    try {
      await addDoc(collection(db, "barbers"), {
        name: newBarber.name,
        phone_no: newBarber.phone_no
      });
      setNewBarber({ name: "", phone_no: "" });
    } catch (error) {
      console.error("Error adding barber: ", error);
    }
  };

  const editBarber = (barber) => {
    setEditingBarber(barber);
    setNewBarber({ name: barber.name, phone_no: barber.phone_no });
  };

  const updateBarber = async () => {
    if (!editingBarber) return;
    try {
      await updateDoc(doc(db, "barbers", editingBarber.id), {
        name: newBarber.name,
        phone_no: newBarber.phone_no
      });
      setEditingBarber(null);
      setNewBarber({ name: "", phone_no: "" });
    } catch (error) {
      console.error("Error updating barber: ", error);
    }
  };

  const removeBarber = async (id) => {
    try {
      await deleteDoc(doc(db, "barbers", id));
      setBarbers(barbers.filter(barber => barber.id !== id));
    } catch (error) {
      console.error("Error deleting barber: ", error);
    }
  };

  const editItem = (item) => {
    setEditingItem(item);
    setNewItem({ name: item.name, price: item.price.toString() });
  };

  const updateItem = async () => {
    if (!editingItem) return;
    try {
      await updateDoc(doc(db, "items", editingItem.id), {
        name: newItem.name,
        price: parseFloat(newItem.price)
      });
      setEditingItem(null);
      setNewItem({ name: "", price: "" });
    } catch (error) {
      console.error("Error updating item: ", error);
    }
  };

  const removeItem = async (id) => {
    try {
      await deleteDoc(doc(db, "items", id));
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error deleting item: ", error);
    }
  };
  
  


  const handlePurchase = async () => {
    if (selectedItems.length === 0 || !customer.name || !customer.phone || !customer.barber) return;

    const selectedBarberObj = barbers.find(barber => barber.name === customer.barber);
    const barberId = selectedBarberObj ? selectedBarberObj.id : null;

    if (!barberId) {
        alert("Selected barber is not valid.");
        return;
    }

    const total = selectedItems.reduce((acc, item) => acc + item.price, 0) * (1 - discount / 100);
    setCustomer({ name: "", phone: "", barber: "", paymentMode: "" });

    try {
        await addDoc(collection(db, "sales"), { 
            customerName: customer.name,
            customerPhone: customer.phone,
            barberId: barberId,
            barberName: customer.barber,
            paymentMode: customer.paymentMode,
            total,
            date: new Date(),
            services: selectedItems.map(item => ({ name: item.name, price: item.price }))
        });

        setTotalSales(prev => prev + total);
        setSelectedItems([]);
        setDiscount(0);
        setDiscountPercent("Discount%");

        const sendMessage = async () => {
            try {
                const response = await fetch("http://localhost:5000/send-message", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        phone: customer.phone,
                        message: `Hello ${customer.name}, your purchase of $${total.toFixed(2)} is successful. Thank you for visiting our salon!`,
                    }),
                });

                const data = await response.json();
                if (data.success) {
                    alert("Message sent successfully!");
                } else {
                    alert("Failed to send message.");
                }
            } catch (error) {
                console.error("Error sending message:", error);
            }
        };

        sendMessage();
    } catch (error) {
        console.error("Error processing purchase: ", error);
    }
  };
  
  

  const removeSelectedItem = (indexToRemove) => {
    setSelectedItems(selectedItems.filter((_, index) => index !== indexToRemove));
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="home">

  <div style={{display:"flex"}} >


    <div
      className="services-all"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)", // 4 items per row
        // gap: "20px",
        gap: "10px 20px", // Reducing row gap while keeping column gap
        padding: "20px",
        position:"relative",
        top:"0px",
        
        // overflow-y: auto; /* Allows scrolling when needed */
      }}
    >
      <div
        className="services"
        style={{
          gridColumn: "1 / -1", // Makes the search bar and heading span full width
          gridRow: "1",
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}
      >
        <h2 className="service-heading" style={{ marginBottom: "15px" }}>
          Services
        </h2>
        <div
          className="search-service"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            marginBottom: "15px",
          }}
        >
          <FaSearch />
          <input
            type="text"
            placeholder="Search Services..."
            className="search-service"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: "0 1 300px",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          />
        </div>
      </div>

      {filteredItems.map((item) => (
        <div
          key={item.id}
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            alignItems: "center",
            border: "1px solid #ddd",
            padding: "15px",
            borderRadius: "5px",
            backgroundColor: "#fff",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
            position: "relative", // Needed for absolute positioning
            
          }}
        >
          <span onClick={() => setSelectedItems([...selectedItems, item])} className="service-name">{item.name} - ${item.price}</span>
          <IoMdAddCircle
            style={{
              position: "absolute",
              bottom: "10px",
              left: "50%",  // Center horizontally
              transform: "translateX(-50%)", // Adjust positioning to exact center
              cursor: "pointer",
              color: "#28a745",
              top:"65%"
            }}
            onClick={() => setSelectedItems([...selectedItems, item])}
            size={25}
          />
        </div>
      ))}
    </div>

  <div className="merge">
  <div
          className="selected-services"
          style={{
            backgroundColor: "#f8f9fa",
            padding: "15px",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            maxWidth: "400px", // Adjust width for better layout
            margin: "20px auto", // Centering
          }}
        >
          <h2
            className="text-lg font-semibold"
            style={{
              textAlign: "center",
              marginBottom: "15px",
              borderBottom: "2px solid #ddd",
              paddingBottom: "5px",
            }}
          >
            Selected Services
          </h2>

          {selectedItems.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px",
                backgroundColor: "#fff",
                borderRadius: "5px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                marginBottom: "10px",
              }}
            >
              <span style={{ fontSize: "16px", fontWeight: "500" }}>
                {item.name} - ${item.price}
              </span>
              <IoIosRemoveCircle
                onClick={() => removeSelectedItem(index)}
                size={25}
                style={{
                  cursor: "pointer",
                  color: "#d9534f",
                  transition: "transform 0.2s ease-in-out",
                }}
                onMouseOver={(e) => (e.target.style.transform = "scale(1.1)")}
                onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
              />
            </div>
          ))}
        </div>



        <div
  className="customer-details"
  style={{
    backgroundColor: "#f8f9fa",
    padding: "8px", // Reduced padding
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    maxWidth: "400px",
    margin: "10px auto", // Reduced margin
    textAlign: "center",
    maxHeight: "220px", // Further reduced height
    overflowY: "auto", // Enables scrolling if needed
  }}
>
  <h2
    className="text-lg font-semibold"
    style={{
      marginBottom: "8px", // Reduced spacing
      borderBottom: "2px solid #ddd",
      paddingBottom: "3px",
      fontSize: "16px", // Slightly smaller font
    }}
  >
    Customer Details
  </h2>

  <input
    type="text"
    placeholder="Name"
    className="border p-1 m-1"
    value={customer.name}
    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
    style={{
      width: "90%",
      padding: "6px", // Reduced padding
      borderRadius: "5px",
      border: "1px solid #ccc",
      marginBottom: "4px", // Reduced margin
      fontSize: "14px",
    }}
  />
  <input
    type="text"
    placeholder="Phone"
    className="border p-1 m-1"
    value={customer.phone}
    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
    style={{
      width: "90%",
      padding: "6px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      marginBottom: "4px",
      fontSize: "14px",
    }}
  />

  <select
    className="border p-1 m-1"
    value={customer.barber}
    onChange={(e) => setCustomer({ ...customer, barber: e.target.value })}
    style={{
      width: "95%",
      padding: "6px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      marginBottom: "4px",
      fontSize: "14px",
    }}
  >
    <option value="">Select Barber</option>
    {barbers.map((barber) => (
      <option key={barber.id} value={barber.name}>
        {barber.name}
      </option>
    ))}
  </select>

  <select
    className="border p-1 m-1"
    value={customer.paymentMode}
    onChange={(e) => setCustomer({ ...customer, paymentMode: e.target.value })}
    style={{
      width: "95%",
      padding: "6px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      marginBottom: "4px",
      fontSize: "14px",
    }}
  >
    <option value="">{payment}</option>
    <option value="cash">Cash</option>
    <option value="online">Online</option>
  </select>
</div>



{/* Discount Section */}
        <div
          className="discount"
          style={{
            backgroundColor: "#fff",
            padding: "15px",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            maxWidth: "400px",
            margin: "20px auto",
            textAlign: "center",
          }}
        >
          <h2
            className="text-lg font-semibold"
            style={{
              marginBottom: "15px",
              borderBottom: "2px solid #ddd",
              paddingBottom: "5px",
            }}
          >
            Discount
          </h2>

          <input
            type="number"
            placeholder={discountpercent}
            className="border p-2 m-1"
            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            style={{
              width: "90%",
              padding: "10px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              marginBottom: "10px",
            }}
          />

          <p
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#333",
              marginBottom: "15px",
            }}
          >
            Total: $
            {selectedItems.reduce((acc, item) => acc + item.price, 0) *
              (1 - discount / 100)}
          </p>

          <button
            className="complete-purchase"
            onClick={handlePurchase}
            style={{
              backgroundColor: "#28a745",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "16px",
              transition: "background 0.3s ease-in-out",
            }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#218838")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "#28a745")}
          >
            Complete Purchase
          </button>
        </div>

      </div>

    </div>
  </div>
        
        
    
  );
};