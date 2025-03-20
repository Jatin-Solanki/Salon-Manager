import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { collection, addDoc, onSnapshot, updateDoc, deleteDoc, doc } from "firebase/firestore";

export const LabPage = () => {
  const [items, setItems] = useState([]); // Managing state inside component
  const [newItem, setNewItem] = useState({ name: "", price: "" });
  const [editingItem, setEditingItem] = useState(null);

  // Fetch items from Firestore
  useEffect(() => {
    const itemsCollection = collection(db, "items");
    const unsubscribe = onSnapshot(itemsCollection, (snapshot) => {
      const fetchedItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(fetchedItems);
    });

    return () => unsubscribe(); // Clean up listener
  }, []);

  // Add item to Firestore
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

  // Update existing item in Firestore
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

  // Delete item from Firestore
  const deleteItem = async (id) => {
    try {
      await deleteDoc(doc(db, "items", id));
    } catch (error) {
      console.error("Error deleting item: ", error);
    }
  };

  // Set item for editing
  const handleEdit = (item) => {
    setEditingItem(item);
    setNewItem({ name: item.name, price: item.price });
  };

  return (
    <div style={{display:"flex" ,justifyContent:"center"}}>

      <div style={{ padding: "16px", border: "1px solid #ccc", borderRadius: "8px" ,width:"500px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600" }}>
            {editingItem ? "Edit Item" : "Add Item"}
          </h2>
          <input
            type="text"
            placeholder="Item Name"
            style={{ border: "1px solid #ccc", padding: "8px", margin: "4px", display: "block", width: "100%" }}
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          />
          <input
            type="number"
            placeholder="Price"
            style={{ border: "1px solid #ccc", padding: "8px", margin: "4px", display: "block", width: "100%" }}
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
          />
          {editingItem ? (
            <button 
              style={{ backgroundColor: "#facc15", color: "white", padding: "8px", borderRadius: "4px", border: "none", margin: "4px" }}
              onClick={updateItem}
            >
              Update
            </button>
          ) : (
            <button 
              style={{ backgroundColor: "#3b82f6", color: "white", padding: "8px", borderRadius: "4px", border: "none", margin: "4px" }}
              onClick={addItem}
            >
              Add
            </button>
          )}

          <div style={{ marginTop: "16px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "600" }}>Items</h2>
            <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #ddd", padding: "8px" }}>
              {items.length > 0 ? (
                items.map((item) => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ccc", padding: "8px" }}>
                    <span>{item.name} - ${item.price}</span>
                    <div>
                      <button 
                        style={{ backgroundColor: "#22c55e", color: "white", padding: "4px 8px", margin: "0 4px", border: "none", borderRadius: "4px" }} 
                        onClick={() => handleEdit(item)}
                      >
                        Edit
                      </button>
                      <button 
                        style={{ backgroundColor: "#ef4444", color: "white", padding: "4px 8px", margin: "0 4px", border: "none", borderRadius: "4px" }} 
                        onClick={() => deleteItem(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No items found.</p>
              )}
            </div>
          </div>
        </div>

    </div>

  );
};
