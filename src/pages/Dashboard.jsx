// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    const localUser = localStorage.getItem("user");
    if (localUser) {
      const parsedUser = JSON.parse(localUser);
      setUser(parsedUser);
      const fetchUserProfile = async () => {
        const userRef = doc(db, "users", parsedUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const profileData = userSnap.data();
          setUser((prev) => ({
            ...prev,
            firstName: profileData.firstName,
            lastName: profileData.lastName,
          }));
        }
      };
      fetchUserProfile();
    }
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    const snap = await getDocs(collection(db, "menuItems"));
    const items = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setMenuItems(items);
  };

  const handleQuantityChange = (itemId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: parseInt(value) || 1,
    }));
  };

  const addToCart = (item) => {
    const quantity = quantities[item.id] || 1;
    const currentCart = JSON.parse(localStorage.getItem("cart")) || [];
    const newItem = { ...item, quantity };
    localStorage.setItem("cart", JSON.stringify([...currentCart, newItem]));
    alert(`${item.name} x${quantity} added to cart.`);
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>
          Welcome,{" "}
          {user?.firstName && user?.lastName
            ? `${user.firstName} ${user.lastName}`
            : user?.email}
        </h2>
        <div>
          {user?.email === "francsha@admin.com" && (
            <button
              className="btn-outline"
              onClick={() => navigate("/admin")}
              style={{ marginRight: "10px" }}
            >
              Switch to Admin Mode
            </button>
          )}
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {/* Menu */}
      <h3>Menu</h3>
      <div className="menu-list">
        {menuItems.map((item) => (
          <div key={item.id} className="menu-item">
            <img
              src={item.image?.trim() || "https://via.placeholder.com/200?text=No+Image"}
              alt={item.name}
            />
            <div className="menu-item-title">{item.name}</div>
            <p>{item.description}</p>
            <p><strong>${item.price?.toFixed(2)}</strong></p>
            <input
              type="number"
              min="1"
              value={quantities[item.id] || 1}
              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
              style={{ width: "60px", marginBottom: "10px" }}
            />
            <button className="add-btn" onClick={() => addToCart(item)}>Add to Cart</button>
          </div>
        ))}
      </div>

      {/* Go to Cart Button */}
      <div style={{ marginTop: "2rem", textAlign: "right" }}>
        <button className="button" onClick={() => navigate("/cart")}>Go to Cart 🛒</button>
      </div>
    </div>
  );
}
