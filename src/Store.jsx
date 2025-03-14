import React, { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import { collection, addDoc, onSnapshot, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

import { LabPage } from "./pages/LabPage/labpage";

import {AboutPage} from "./pages/About/aboutpage"

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

    // Find the barberId based on the selected barber name
    const selectedBarberObj = barbers.find(barber => barber.name === customer.barber);
    const barberId = selectedBarberObj ? selectedBarberObj.barberId : null;

    if (!barberId) {
        alert("Selected barber is not valid.");
        return;
    }

    const total = selectedItems.reduce((acc, item) => acc + item.price, 0) * (1 - discount / 100);
    setCustomer({ name: "", phone: "", barber: "", paymentMode: "" });

    try {
        // Store sales data with barberId
        await addDoc(collection(db, "sales"), { 
            customerName: customer.name,
            customerPhone: customer.phone,
            barberId: barberId, // Store barberId instead of barber name
            barberName: customer.barber, // Also store barber name for reference
            paymentMode: customer.paymentMode,
            total,
            date: new Date()
        });

        setTotalSales(prev => prev + total);
        setSelectedItems([]);
        setDiscount(0);
        setDiscountPercent("Discount%");

        // Send message after successful purchase
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
    <div className="p-4 max-w-lg mx-auto">
      
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Barbers</h2>
        {barbers.map(barber => (
          <div key={barber.id} className="flex justify-between border p-2">
            <span>{barber.name} - {barber.phone_no}</span>
            <div>
              <button className="bg-yellow-500 text-white px-2 mx-1" onClick={() => editBarber(barber)}>Edit</button>
              <button className="bg-red-500 text-white px-2 mx-1" onClick={() => removeBarber(barber.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Items</h2>
        <div>
          <input
          type="text"
          placeholder="Search items..."
          className="border p-2 m-1 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        </div>


        {filteredItems.map(item => (
          <div key={item.id} className="flex justify-between border p-2">
            <span>{item.name} - ${item.price}</span>
            <div>
              <button className="bg-green-500 text-white px-2 mx-1" onClick={() => setSelectedItems([...selectedItems, item])}>+</button>
              {/* <button className="bg-yellow-500 text-white px-2 mx-1" onClick={() => editItem(item)}>Edit</button> */}
              <button className="bg-red-500 text-white px-2 mx-1" onClick={() => removeItem(item.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Selected Items</h2>
        {selectedItems.map((item, index) => (
          <div key={index} className="flex justify-between border p-2">
            <span>{item.name} - ${item.price}</span>
            <button className="bg-red-500 text-white px-2" onClick={() => removeSelectedItem(index)}>-</button>
          </div>
        ))}
      </div>


      <div className="mt-4">
        <h2 className="text-lg font-semibold">Customer Details</h2>
        <input
          type="text"
          placeholder="Name"
          className="border p-2 m-1"
          value={customer.name}
          onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Phone"
          className="border p-2 m-1"
          value={customer.phone}
          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
        />
        <select
          className="border p-2 m-1"
          value={customer.barber}
          onChange={(e) => setCustomer({ ...customer, barber: e.target.value })}
        >
          <option value="">Select Barber</option>
          {barbers.map((barber) => (
            <option key={barber.id} value={barber.name}>
              {barber.name}
            </option>
          ))}
        </select>
        <select
          className="border p-2 m-1"
          value={customer.paymentMode}
          onChange={(e) => setCustomer({ ...customer, paymentMode: e.target.value })}
        >
          <option value="">{payment}</option>
          <option value="cash">Cash</option>
          <option value="online">Online</option>
        </select>
      </div>


      <div className="mt-4">
        <h2 className="text-lg font-semibold">Discount</h2>
        <input type="number" placeholder={discountpercent} className="border p-2 m-1" onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} />
      </div>

      <div className="mt-4 font-bold">
        Total: ${selectedItems.reduce((acc, item) => acc + item.price, 0) * (1 - discount / 100)}
      </div>

      <button className="bg-red-500 text-white p-2 mt-2" onClick={handlePurchase}>Complete Purchase</button>
    </div>
  );
};