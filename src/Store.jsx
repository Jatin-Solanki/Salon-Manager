import React, { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import { collection, addDoc, onSnapshot, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";


export const StoreApp = () => {
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [customer, setCustomer] = useState({ name: "", phone: "" ,barber: "" });
  const [discount, setDiscount] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [newItem, setNewItem] = useState({ name: "", price: "" });
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newBarber, setNewBarber] = useState({ name: "", phone_no: "" });
  const [editingBarber, setEditingBarber] = useState(null);
  const [barbers, setBarbers] = useState([]);
  // useEffect(() => {
  //   const unsubscribe = onSnapshot(collection(db, "items"), (snapshot) => {
  //     setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  //   });
  //   return () => unsubscribe(); // Cleanup on unmount
  // }, []);
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
    const total = selectedItems.reduce((acc, item) => acc + item.price, 0) * (1 - discount / 100);
    setCustomer({ name: "", phone: "" ,barber:""});
    try {
      await addDoc(collection(db, "sales"), { customer, total, date: new Date() });
      setTotalSales(prev => prev + total);
      setSelectedItems([]);
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
      <h1 className="text-xl font-bold mb-4">Store Management</h1>   
      <div>
        <h2 className="text-lg font-semibold">{editingItem ? "Edit Item" : "Add Item"}</h2>
        <input type="text" placeholder="Item Name" className="border p-2 m-1" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
        <input type="number" placeholder="Price" className="border p-2 m-1" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} />
        {editingItem ? (
          <button className="bg-yellow-500 text-white p-2 rounded" onClick={updateItem}>Update</button>
        ) : (
          <button className="bg-blue-500 text-white p-2 rounded" onClick={addItem}>Add</button>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold">Add Barber</h2>
        <input type="text" placeholder="Barber Name" className="border p-2 m-1" value={newBarber.name} onChange={(e) => setNewBarber({ ...newBarber, name: e.target.value })} />
        <input type="text" placeholder="Phone No" className="border p-2 m-1" value={newBarber.phone_no} onChange={(e) => setNewBarber({ ...newBarber, phone_no: e.target.value })} />
        {editingBarber ? (
          <button className="bg-yellow-500 text-white p-2 rounded" onClick={updateBarber}>Update Barber</button>
        ) : (
          <button className="bg-green-500 text-white p-2 rounded" onClick={addBarber}>Add Barber</button>
        )}
      </div>
      
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
              <button className="bg-yellow-500 text-white px-2 mx-1" onClick={() => editItem(item)}>Edit</button>
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
        <input type="text" placeholder="Name" className="border p-2 m-1" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} />
        <input type="text" placeholder="Phone" className="border p-2 m-1" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} />
        <select className="border p-2 m-1" value={customer.barber} onChange={(e) => setCustomer({ ...customer, barber: e.target.value })}>
          <option value="">Select Barber</option>
          {barbers.map(barber => (
            <option key={barber.id} value={barber.name}>{barber.name}</option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Discount</h2>
        <input type="number" placeholder="Discount %" className="border p-2 m-1" onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} />
      </div>

      <div className="mt-4 font-bold">
        Total: ${selectedItems.reduce((acc, item) => acc + item.price, 0) * (1 - discount / 100)}
      </div>

      <button className="bg-red-500 text-white p-2 mt-2" onClick={handlePurchase}>Complete Purchase</button>
    </div>
  );
};