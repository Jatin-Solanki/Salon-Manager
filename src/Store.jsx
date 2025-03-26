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
  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [manualService, setManualService] = useState({ name: "", price: "" });

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

  const addManualService = () => {
    if (!manualService.name || !manualService.price) return;
    const newService = { name: manualService.name, price: parseFloat(manualService.price) };
    setSelectedItems([...selectedItems, newService]);
    setManualService({ name: "", price: "" });
  };

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
  
  const calculateTotal = () => {
    let total = selectedItems.reduce((acc, item) => acc + item.price, 0);
    if (discountType === "percentage") {
      return total * (1 - discountValue / 100);
    } else {
      return total - discountValue;
    }
  };

  const removeSelectedItem = (indexToRemove) => {
    setSelectedItems(selectedItems.filter((_, index) => index !== indexToRemove));
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedSelectedItems = selectedItems.reduce((acc, item) => {
    const existingItem = acc.find(i => i.name === item.name);
    if (existingItem) {
      existingItem.count += 1;
    } else {
      acc.push({ ...item, count: 1 });
    }
    return acc;
  }, []);

  return (
    <div className="home" style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0px",
      width: "800px",
      // maxWidth: "1500px",
      margin: "0 auto",
      position:"absolute",
      right:"0px"
    }}>
      
      {/* Services & Selection Container */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: "800px",
      }}>
        
        {/* Services Section */}
        <div className="services-all" style={{
          width: "100%",
          maxWidth: "700px",
          height: "500px",
          overflowY: "auto",
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "12px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}>
          <h2 className="service-heading" style={{
            textAlign: "center",
            fontSize: "20px",
            fontWeight: "600",
          }}>
            Services
          </h2>
          
          {/* Search Bar */}
          <div className="search-service" style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "15px",
          }}>
            <FaSearch />
            <input type="text" placeholder="Search Services..." className="search-service"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: "1",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            />
          </div>
    
          {/* Manual Service Entry */}
          <div className="manual-service" style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "15px",
            marginTop: "10px",
          }}>
            <input type="text" placeholder="Service Name" value={manualService.name}
              onChange={(e) => setManualService({ ...manualService, name: e.target.value })}
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                flex: "1",
              }}
            />
            <input type="number" placeholder="Price" value={manualService.price}
              onChange={(e) => setManualService({ ...manualService, price: e.target.value })}
              style={{
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                flex: "1",
              }}
            />
            <button onClick={addManualService} style={{
              backgroundColor: "#007bff",
              color: "white",
              padding: "8px 12px",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
            }}>Enter</button>
          </div>
    
          {/* Services List */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px",
            overflowY: "auto",
            maxHeight: "400px",
          }}>
            {filteredItems.map((item) => (
              <div key={item.id} style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                backgroundColor: "#fff",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                cursor: "pointer",
                transition: "all 0.2s ease-in-out",
              }}>
                <span className="service-name" style={{ fontSize: "14px", fontWeight: "500" }}>{item.name} - Rs.{item.price}</span>
                <IoMdAddCircle size={25} style={{
                  cursor: "pointer",
                  color: "#28a745",
                  marginTop: "5px",
                }} onClick={() => setSelectedItems([...selectedItems, item])} />
              </div>
            ))}
          </div>
        </div>
    
        {/* Selected Services */}
        <div className="selected-services" style={{
          width: "60%",
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          maxHeight:"250px",
          overflowY: "auto",
        }}>
          <h2 className="text-lg font-semibold">Selected Services</h2>

          {groupedSelectedItems.map((item, index) => (
          <div key={index}  style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "5px 0"}}>
            <span>{item.name} {item.count > 1 ? `x${item.count}` : ""} - Rs.{item.price * item.count}</span>
            <IoIosRemoveCircle style={{ cursor: "pointer", color: "red" }} size={25} onClick={() => removeSelectedItem(index)} />
          </div>
        ))}

        </div>
    
        {/* Customer Details & Discount */}
        <div style={{    display: "flex",
            flexWrap: "wrap",
            width: "100%",
            marginTop: "20px",
            gap: "20px",
            justifyContent: "center", }}>
          
          {/* Customer Details */}
          <div className="customer-details" style={{
            flex: "1",
            minWidth: "280px",
            padding: "20px",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.2s ease-in-out",
          }}>
            <h2 className="text-lg font-semibold" style={{fontSize: "18px",
              fontWeight: "600",
              marginBottom: "10px",
              textAlign: "center",
              color: "#333"}}>Customer Details</h2>
            <input style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            outline: "none",
            transition: "border 0.2s ease-in-out",
          }} type="text" placeholder="Name" className="border p-1 m-1"
              value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
            <input  style={{
            width: "100%",
            padding: "10px",
            marginBottom: "10px",
            border: "1px solid #ccc",
            borderRadius: "6px",
          }} type="text" placeholder="Phone" className="border p-1 m-1"
              value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />

    <select className="border p-1 m-1"
        value={customer.barber} onChange={(e) => setCustomer({ ...customer, barber: e.target.value })}
        style={{ width: "100%", padding: "10px", border: "1px solid #ccc", borderRadius: "6px", cursor: "pointer" }}>
        <option value="">Select Barber</option>
        {barbers.map((barber) => (
          <option key={barber.id} value={barber.name}>{barber.name}</option>
        ))}
      </select>
          
        <select className="border p-1 m-1"
          value={customer.paymentMode} onChange={(e) => setCustomer({ ...customer, paymentMode: e.target.value })}
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          <option value="">Select Payment Mode</option>
          <option value="cash">Cash</option>
          <option value="online">Online</option>
        </select>
          </div>
    
          {/* Discount Section */}
      <div className="discount" style={{ flex: "1", minWidth: "280px", padding: "20px", backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", transition: "transform 0.2s ease-in-out" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "10px", textAlign: "center", color: "#333" }}>Discount</h2>
        <select value={discountType} onChange={(e) => setDiscountType(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "10px", border: "1px solid #ccc", borderRadius: "6px", cursor: "pointer" }}>
          <option value="percentage">Percentage</option>
          <option value="fixed">Rs.</option>
        </select>
        <input type="number" placeholder="Enter Discount" value={discountValue} onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)} style={{ width: "100%", padding: "10px", marginBottom: "10px", border: "1px solid #ccc", borderRadius: "6px" }} />
        <p style={{ fontSize: "16px", fontWeight: "500", textAlign: "center", marginBottom: "10px" }}>Total: Rs. {calculateTotal()}</p>
      </div>
    
  </div>
    
         {/* Complete Purchase Button */}
    <button
      className="complete-purchase"
      onClick={handlePurchase}
      disabled={selectedItems.length === 0 || !customer.name || !customer.phone || !customer.barber || !customer.paymentMode}
      style={{
        marginTop: "20px",
        backgroundColor: selectedItems.length === 0 || !customer.name || !customer.phone || !customer.barber || !customer.paymentMode
          ? "#ccc" : "#28a745",
        color: "white",
        padding: "12px 20px",
        border: "none",
        borderRadius: "6px",
        cursor: selectedItems.length === 0 || !customer.name || !customer.phone || !customer.barber || !customer.paymentMode
          ? "not-allowed" : "pointer",
        fontSize: "16px",
        fontWeight: "600",
        transition: "background 0.3s ease-in-out",
      }}
    >
      Complete Purchase
    </button>
      </div>
    </div>
    
  );
};