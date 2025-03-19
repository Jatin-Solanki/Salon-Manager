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
        <button className="bg-yellow-500 text-white p-2 rounded m-1" onClick={updateItem}>
          Update
        </button>
      ) : (
        <button className="bg-blue-500 text-white p-2 rounded m-1" onClick={addItem}>
          Add
        </button>
      )}

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Items</h2>
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="flex justify-between border p-2 items-center">
              <span>{item.name} - ${item.price}</span>
              <div>
                <button
                  className="bg-green-500 text-white p-1 rounded mx-1"
                  onClick={() => handleEdit(item)}
                >
                  Edit
                </button>
                <button
                  className="bg-red-500 text-white p-1 rounded"
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
  );
};
