// src/pages/Admin.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { format } from "date-fns";

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [ordersByDate, setOrdersByDate] = useState({});

  useEffect(() => {
    const localUser = localStorage.getItem("user");
    if (localUser) setUser(JSON.parse(localUser));
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const snapshot = await getDocs(collection(db, "orders"));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setOrders(data);

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

  return (
    <div className="container">
      <div className="card">
        <h2>Welcome Admin: {user?.email}</h2>
        <p>Select a date to view orders.</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "1rem" }}>
          {Object.keys(ordersByDate).map(date => (
            <button
              key={date}
              className="button"
              style={{ backgroundColor: selectedDate === date ? "#4338ca" : undefined }}
              onClick={() => setSelectedDate(date)}
            >
              {date} ({ordersByDate[date].length})
            </button>
          ))}
        </div>

        {selectedDate && (
          <div>
            <h3>Orders on {selectedDate}:</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Payment</th>
                  <th>Items</th>
                </tr>
              </thead>
              <tbody>
                {ordersByDate[selectedDate].map((order) => (
                  <tr key={order.id}>
                    <td>{order.userEmail || "N/A"}</td>
                    <td>{order.paymentMethod || "Cash"}</td>
                    <td>
                      {order.cart.map((item, i) => (
                        <div key={i}>{item.name} ({item.customIngredients?.join(", ")})</div>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button className="button" onClick={handleLogout} style={{ marginTop: "1rem" }}>
          Logout
        </button>
      </div>
    </div>
  );
}