import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { collection, doc, setDoc, onSnapshot, updateDoc, deleteDoc, addDoc } from "firebase/firestore";

export const AboutPage = ({ setBarbers }) => {
  const [newBarber, setNewBarber] = useState({ name: "", phone_no: "" });
  const [editingBarber, setEditingBarber] = useState(null);
  const [barbers, setLocalBarbers] = useState([]);

  useEffect(() => {
    const unsubscribeBarbers = onSnapshot(collection(db, "barbers"), (snapshot) => {
      const barberList = snapshot.docs.map(doc => ({ barberId: doc.id, ...doc.data() }));
      setLocalBarbers(barberList);
      if (setBarbers) setBarbers(barberList);  // Ensure setBarbers is used safely
    });

    return () => unsubscribeBarbers();
  }, [setBarbers]);

  const addBarber = async () => {
    if (!newBarber.name || !newBarber.phone_no) return;
    try {
      const barberRef = await addDoc(collection(db, "barbers"), {
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
    } catch (error) {
      console.error("Error deleting barber: ", error);
    }
  };

  return (
  
<div style={{display:"flex",position:"absolute",right:"170px", top:"70px" }}>
  <div className="add-barber" style={{ padding: "16px", border: "1px solid #ccc", borderRadius: "8px" , width:"500px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "600" }}>
            {editingBarber ? "Edit Barber" : "Add Barber"}
          </h2>
          <input
            type="text"
            placeholder="Barber Name"
            style={{ border: "1px solid #ccc", padding: "8px", margin: "4px", display: "block", width: "95%" }}
            value={newBarber.name}
            onChange={(e) => setNewBarber({ ...newBarber, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Phone No"
            style={{ border: "1px solid #ccc", padding: "8px", margin: "4px", display: "block", width: "95%" }}
            value={newBarber.phone_no}
            onChange={(e) => setNewBarber({ ...newBarber, phone_no: e.target.value })}
          />
          {editingBarber ? (
            <button 
              style={{ backgroundColor: "#facc15", color: "white", padding: "8px", borderRadius: "4px", border: "none", marginTop: "8px" ,cursor:"pointer" }}
              onClick={updateBarber}
            >
              Update Barber
            </button>
          ) : (
            <button 
              style={{ backgroundColor: "#22c55e", color: "white", padding: "8px", borderRadius: "4px", border: "none", marginTop: "8px" , cursor:"pointer" }}
              onClick={addBarber}
            >
              Add Barber
            </button>
          )}

        <div style={{ marginTop: "16px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "600" }}>Barbers List</h2>
            <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #ddd", padding: "8px" }} >
            {barbers.length > 0 ? (
              barbers.map((barber) => (
                <div key={barber.barberId} style={{ display: "flex", justifyContent: "space-between", border: "1px solid #ccc", padding: "8px", marginTop: "4px" ,maxHeight:"100px", overflowY:"auto" }}>
                  <span>{barber.name} - {barber.phone_no}</span>
                  <div>
                    <button 
                      style={{ backgroundColor: "#facc15", color: "white", padding: "4px 8px", margin: "0 4px", border: "none", borderRadius: "4px" , cursor:"pointer" }} 
                      onClick={() => editBarber(barber)}
                    >
                      Edit
                    </button>
                    <button 
                      style={{ backgroundColor: "#ef4444", color: "white", padding: "4px 8px", margin: "0 4px", border: "none", borderRadius: "4px" , cursor:"pointer" }} 
                      onClick={() => removeBarber(barber.barberId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No barbers found.</p>
            )}
          </div>
        </div>
  </div>
</div>
    

  );
};
