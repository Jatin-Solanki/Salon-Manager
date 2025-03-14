// import "./aboutpage.css";

// export const AboutPage=()=>{
//     return(
//         <>
//         <div className="about">
//             <h1>ADD Barber</h1>
//         </div>
//         </>
//     )
// }

import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { collection, doc, setDoc, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";

export const AboutPage = ({ setBarbers }) => {
  const [newBarber, setNewBarber] = useState({ name: "", phone_no: "" });
  const [editingBarber, setEditingBarber] = useState(null);
  const [barbers, setLocalBarbers] = useState([]);

  useEffect(() => {
    const unsubscribeBarbers = onSnapshot(collection(db, "barbers"), (snapshot) => {
      const barberList = snapshot.docs.map(doc => ({ barberId: doc.id, ...doc.data() }));
      setBarbers(barberList);
      setLocalBarbers(barberList);
    });
    return () => unsubscribeBarbers();
  }, [setBarbers]);

  const addBarber = async () => {
    if (!newBarber.name || !newBarber.phone_no) return;
    try {
      const barberRef = doc(collection(db, "barbers")); // Create a unique barberId
      await setDoc(barberRef, {
        barberId: barberRef.id, // Store barberId in Firestore
        name: newBarber.name,
        phone_no: newBarber.phone_no,
      });
      setNewBarber({ name: "", phone_no: "" });
    } catch (error) {
      console.error("Error adding barber: ", error);
    }
  };

  const updateBarber = async () => {
    if (!editingBarber) return;
    try {
      await updateDoc(doc(db, "barbers", editingBarber.barberId), {
        name: newBarber.name,
        phone_no: newBarber.phone_no,
      });
      setEditingBarber(null);
      setNewBarber({ name: "", phone_no: "" });
    } catch (error) {
      console.error("Error updating barber: ", error);
    }
  };

  const editBarber = (barber) => {
    setEditingBarber(barber);
    setNewBarber({ name: barber.name, phone_no: barber.phone_no });
  };

  const removeBarber = async (barberId) => {
    try {
      await deleteDoc(doc(db, "barbers", barberId));
      setLocalBarbers(barbers.filter(barber => barber.barberId !== barberId));
    } catch (error) {
      console.error("Error deleting barber: ", error);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold">{editingBarber ? "Edit Barber" : "Add Barber"}</h2>
      <input
        type="text"
        placeholder="Barber Name"
        className="border p-2 m-1"
        value={newBarber.name}
        onChange={(e) => setNewBarber({ ...newBarber, name: e.target.value })}
      />
      <input
        type="text"
        placeholder="Phone No"
        className="border p-2 m-1"
        value={newBarber.phone_no}
        onChange={(e) => setNewBarber({ ...newBarber, phone_no: e.target.value })}
      />
      {editingBarber ? (
        <button className="bg-yellow-500 text-white p-2 rounded" onClick={updateBarber}>
          Update Barber
        </button>
      ) : (
        <button className="bg-green-500 text-white p-2 rounded" onClick={addBarber}>
          Add Barber
        </button>
      )}

      <div className="mt-4">
        <h2 className="text-lg font-semibold">Barbers List</h2>
        {barbers.length > 0 ? (
          barbers.map(barber => (
            <div key={barber.barberId} className="flex justify-between border p-2">
              <span>{barber.name} - {barber.phone_no}</span>
              <div>
                <button className="bg-yellow-500 text-white px-2 mx-1" onClick={() => editBarber(barber)}>Edit</button>
                <button className="bg-red-500 text-white px-2 mx-1" onClick={() => removeBarber(barber.barberId)}>Remove</button>
              </div>
            </div>
          ))
        ) : (
          <p>No barbers found.</p>
        )}
      </div>
    </div>
  );
};
