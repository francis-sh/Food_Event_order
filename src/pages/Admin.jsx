// Admin.jsx
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { format } from "date-fns";
import { seedMenu } from "./SeedMenu";

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [ordersByDate, setOrdersByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [newSlot, setNewSlot] = useState("");

  useEffect(() => {
    const localUser = localStorage.getItem("user");
    if (localUser) {
      const parsedUser = JSON.parse(localUser);
      setUser(parsedUser);

      const fetchName = async () => {
        const userRef = doc(db, "users", parsedUser.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const profile = snap.data();
          setUser((prev) => ({
            ...prev,
            firstName: profile.firstName,
            lastName: profile.lastName,
          }));
        }
      };
      fetchName();
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const snapshot = await getDocs(collection(db, "orders"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const grouped = {};
    data.forEach((order) => {
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

  const handleSwitchToUser = () => navigate("/dashboard");

  const loadTimeSlots = async (dateStr) => {
    const ref = doc(db, "timeSlots", dateStr);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setTimeSlots(snap.data().slots || []);
    } else {
      setTimeSlots([]);
    }
  };

  const handleDateChange = (dateObj) => {
    const dateStr = format(dateObj, "yyyy-MM-dd");
    setSelectedDate(dateStr);
    loadTimeSlots(dateStr);
  };

  const handleAddSlot = async () => {
    if (!newSlot.trim() || !selectedDate) return;
    const updatedSlots = [...timeSlots, newSlot.trim()];
    await setDoc(doc(db, "timeSlots", selectedDate), {
      slots: updatedSlots,
    });
    setTimeSlots(updatedSlots);
    setNewSlot("");
  };

  const handleRemoveSlot = async (slotToRemove) => {
    const updatedSlots = timeSlots.filter((slot) => slot !== slotToRemove);
    await updateDoc(doc(db, "timeSlots", selectedDate), {
      slots: updatedSlots,
    });
    setTimeSlots(updatedSlots);
  };

  const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour += 2) {
    const start = `${hour.toString().padStart(2, "0")}:00`;
    const end = `${((hour + 2) % 24).toString().padStart(2, "0")}:00`;
    slots.push(`${start} - ${end}`);
  }
  return slots;
};

  const getOrderStats = (orders) => {
    const stats = {};
    orders.forEach((order) => {
      const slot = order.timeSlot;
      if (!stats[slot]) stats[slot] = { count: 0, items: 0 };
      stats[slot].count++;
      stats[slot].items += order.cart.length;
    });
    return stats;
  };

  const selectedOrders = selectedDate ? ordersByDate[selectedDate] || [] : [];
  const slotStats = getOrderStats(selectedOrders);

  return (
    <div className="container">
      <div className="card">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>👋 Hello, {user?.firstName} {user?.lastName}</h2>
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

        {/* Calendar */}
        <div style={{ marginTop: "2rem" }}>
          <h3>Select a date to view orders or manage time slots:</h3>
          <Calendar
            onChange={handleDateChange}
            value={selectedDate ? new Date(selectedDate) : new Date()}
            tileContent={({ date }) => {
              const dateStr = format(date, "yyyy-MM-dd");
              return ordersByDate[dateStr] ? (
                <span role="img" aria-label="has-orders">🔪</span>
              ) : null;
            }}
          />
        </div>

        {/* Time Slot Manager */}
        {selectedDate && (
          <div style={{ marginTop: "2rem" }}>
            <h3>Time Slots for {selectedDate}</h3>
            {timeSlots.length === 0 && <p><em>No time slots set</em></p>}
            <ul>
              {timeSlots.map((slot, idx) => {
                const isFull = slotStats[slot]?.count >= 10 || slotStats[slot]?.items >= 30;
                return (
                  <li key={idx} style={{ marginBottom: "6px", color: isFull ? "red" : "black" }}>
                    {slot} {isFull && <span>🔥</span>}
                    <button
                      style={{ color: "red", marginLeft: "10px", cursor: "pointer" }}
                      onClick={() => handleRemoveSlot(slot)}
                    >
                      ❌ Remove
                    </button>
                  </li>
                );
              })}
            </ul>
            <div style={{ marginTop: "1rem", display: "flex", gap: "10px" }}>
             <select value={newSlot} onChange={(e) => setNewSlot(e.target.value)}>
  <option value="">-- Select Time Slot --</option>
  {generateTimeSlots()
    .filter(slot => !timeSlots.includes(slot))
    .map((slot, idx) => (
      <option key={idx} value={slot}>{slot}</option>
    ))}
</select>
<button className="button" onClick={handleAddSlot} disabled={!newSlot}>
  Add Slot
</button>
            </div>
          </div>
        )}

        {/* Orders Table */}
        {selectedOrders.length > 0 && (
          <div style={{ marginTop: "2rem" }}>
            <h3>Orders on {selectedDate}:</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Time Slot</th>
                  <th>Type</th>
                  <th>Payment</th>
                  <th>Items</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.userEmail}</td>
                    <td>{order.timeSlot}</td>
                    <td>{order.orderType}</td>
                    <td>{order.paymentMethod}</td>
                    <td>
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
