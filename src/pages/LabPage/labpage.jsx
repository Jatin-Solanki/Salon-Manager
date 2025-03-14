// import './labpage.css'
// export const LabPage=()=>{
//     return(
//         <>
//         <div className="labpage">
//             <h1>ADD Items</h1>
//         </div>
//         </>
//     )
// }

import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { collection, addDoc, onSnapshot, updateDoc, doc } from "firebase/firestore";

export const LabPage = ({ items = [], setItems }) => {
  const [newItem, setNewItem] = useState({ name: "", price: "" });
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    const unsubscribeItems = onSnapshot(collection(db, "items"), (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribeItems();
  }, [setItems]);

  const addItem = async () => {
    if (!newItem.name || !newItem.price) return;
    try {
      await addDoc(collection(db, "items"), {
        name: newItem.name,
        price: parseFloat(newItem.price),
      });
      setNewItem({ name: "", price: "" });
    } catch (error) {
      console.error("Error adding item: ", error);
    }
  };

  const updateItem = async () => {
    if (!editingItem) return;
    try {
      await updateDoc(doc(db, "items", editingItem.id), {
        name: newItem.name,
        price: parseFloat(newItem.price),
      });
      setEditingItem(null);
      setNewItem({ name: "", price: "" });
    } catch (error) {
      console.error("Error updating item: ", error);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold">{editingItem ? "Edit Item" : "Add Item"}</h2>
      <input
        type="text"
        placeholder="Item Name"
        className="border p-2 m-1"
        value={newItem.name}
        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
      />
      <input
        type="number"
        placeholder="Price"
        className="border p-2 m-1"
        value={newItem.price}
        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
      />
      {editingItem ? (
        <button className="bg-yellow-500 text-white p-2 rounded" onClick={updateItem}>
          Update
        </button>
      ) : (
        <button className="bg-blue-500 text-white p-2 rounded" onClick={addItem}>
          Add
        </button>
      )}
      
      <div className="mt-4">
        <h2 className="text-lg font-semibold">Items</h2>
        {items.length > 0 ? (
          items.map(item => (
            <div key={item.id} className="flex justify-between border p-2">
              <span>{item.name} - ${item.price}</span>
            </div>
          ))
        ) : (
          <p>No items found.</p>
        )}
      </div>
    </div>
  );
};





