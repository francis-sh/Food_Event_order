import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, getDocs, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { seedMenu } from "./SeedMenu"; // Adjust if your path differs

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [ordersByDate, setOrdersByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [newSlot, setNewSlot] = useState("");

  useEffect(() => {
    const localUser = localStorage.getItem("user");
    if (localUser) setUser(JSON.parse(localUser));
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const snapshot = await getDocs(collection(db, "orders"));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const grouped = {};
    data.forEach(order => {
      const date = order.date;
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(order);
    });

    setOrdersByDate(grouped);
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleSwitchToUser = () => {
    navigate("/dashboard");
  };

  const loadTimeSlots = async (date) => {
    const ref = doc(db, "timeSlots", date);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setTimeSlots(snap.data().slots || []);
    } else {
      setTimeSlots([]);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    loadTimeSlots(date);
  };

  const handleAddSlot = async () => {
    if (!newSlot.trim()) return;
    const updatedSlots = [...timeSlots, newSlot.trim()];
    setTimeSlots(updatedSlots);
    await setDoc(doc(db, "timeSlots", selectedDate), {
      slots: updatedSlots
    });
    setNewSlot("");
  };

  const handleRemoveSlot = async (slotToRemove) => {
    const updatedSlots = timeSlots.filter(slot => slot !== slotToRemove);
    setTimeSlots(updatedSlots);
    await updateDoc(doc(db, "timeSlots", selectedDate), {
      slots: updatedSlots
    });
  };

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Welcome Admin: {user?.email}</h2>
          <div>
            <button className="btn-outline" onClick={handleSwitchToUser} style={{ marginRight: "10px" }}>
              Switch to User Mode
            </button>
            <button className="btn-outline" onClick={seedMenu} style={{ marginRight: "10px" }}>
              Seed Menu
            </button>
            <button className="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <p style={{ marginTop: "1rem" }}>Select a date to view orders or manage time slots:</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", margin: "1rem 0" }}>
          {Object.keys(ordersByDate).map(date => (
            <button
              key={date}
              className="button"
              style={{ backgroundColor: selectedDate === date ? "#4338ca" : undefined }}
              onClick={() => handleDateClick(date)}
            >
              {date} ({ordersByDate[date].length})
            </button>
          ))}
        </div>

        {/* Time Slot Manager */}
        {selectedDate && (
          <div style={{ marginTop: "2rem" }}>
            <h3>Time Slots for {selectedDate}</h3>
            <div>
              {timeSlots.length === 0 && <p><em>No time slots set</em></p>}
              <ul>
                {timeSlots.map((slot, idx) => (
                  <li key={idx} style={{ marginBottom: "6px" }}>
                    {slot}{" "}
                    <button
                      style={{ color: "red", marginLeft: "10px", cursor: "pointer" }}
                      onClick={() => handleRemoveSlot(slot)}
                    >
                      ❌ Remove
                    </button>
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: "1rem", display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  placeholder="e.g. 10:00 - 12:00"
                  value={newSlot}
                  onChange={(e) => setNewSlot(e.target.value)}
                />
                <button className="button" onClick={handleAddSlot}>Add Slot</button>
              </div>
            </div>
          </div>
        )}

        {/* Orders table */}
        {selectedDate && ordersByDate[selectedDate] && (
          <div style={{ marginTop: "2rem" }}>
            <h3>Orders on {selectedDate}:</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
              <thead>
                <tr>
                  <th style={{ textAlign: "left", padding: "8px" }}>Email</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Time Slot</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Type</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Payment</th>
                  <th style={{ textAlign: "left", padding: "8px" }}>Items</th>
                </tr>
              </thead>
              <tbody>
                {ordersByDate[selectedDate].map((order) => (
                  <tr key={order.id}>
                    <td style={{ padding: "8px" }}>{order.userEmail || "N/A"}</td>
                    <td style={{ padding: "8px" }}>{order.timeSlot || "-"}</td>
                    <td style={{ padding: "8px" }}>{order.orderType}</td>
                    <td style={{ padding: "8px" }}>{order.paymentMethod || "Cash"}</td>
                    <td style={{ padding: "8px" }}>
                      {order.cart.map((item, i) => (
                        <div key={i}>{item.name}</div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
