// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { format } from "date-fns";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [pickupDate, setPickupDate] = useState("");

  useEffect(() => {
    const localUser = localStorage.getItem("user");
    if (localUser) setUser(JSON.parse(localUser));
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    const snap = await getDocs(collection(db, "menuItems"));
    const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setMenuItems(items);
  };

  const addToCart = (item) => {
    setCart(prev => [...prev, item]);
  };

  const removeFromCart = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const handleOrder = async () => {
    if (!pickupDate || cart.length === 0) return alert("Please select date and items.");
    await addDoc(collection(db, "orders"), {
      userId: user.uid,
      userEmail: user.email,
      cart,
      date: pickupDate,
      paymentMethod: "Cash",
      createdAt: new Date()
    });
    alert("Order submitted!");
    setCart([]);
    setPickupDate("");
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="container" style={{ padding: "2rem" }}>
      <div className="card" style={{ maxWidth: "1000px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Welcome, {user?.email}</h2>
          <button className="button" onClick={handleLogout}>Logout</button>
        </div>

        <h3>Menu</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.5rem" }}>
          {menuItems.map(item => (
            <div key={item.id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12, background: "#fff", transition: "0.3s", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <img src={item.image} alt={item.name} style={{ width: "100%", height: 120, objectFit: "cover", borderRadius: 6 }} />
              <h4 style={{ margin: "10px 0 5px" }}>{item.name}</h4>
              <p style={{ fontSize: "0.9rem", color: "#555" }}>{item.description}</p>
              <button className="button" onClick={() => addToCart(item)}>Add</button>
            </div>
          ))}
        </div>

        <h3>Your Cart</h3>
        {cart.length === 0 ? (
          <p style={{ fontStyle: "italic" }}>Cart is empty</p>
        ) : (
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {cart.map((item, idx) => (
              <li key={idx} style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "space-between" }}>
                {item.name} <button onClick={() => removeFromCart(idx)} style={{ color: "red", border: "none", background: "none" }}>❌</button>
              </li>
            ))}
          </ul>
        )}

        <div style={{ marginTop: "1.5rem" }}>
          <h4>Pickup Date</h4>
          <input
            type="date"
            value={pickupDate}
            onChange={e => setPickupDate(e.target.value)}
            className="input"
            style={{ marginBottom: "1rem" }}
          />
          <button className="button" onClick={handleOrder}>Submit Order</button>
        </div>
      </div>
    </div>
  );
}