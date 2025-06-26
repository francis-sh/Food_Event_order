// src/pages/Cart.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { v4 as uuidv4 } from "uuid"; // npm i uuid
import emailjs from '@emailjs/browser'; // ✅ correct


export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [pickupDate, setPickupDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [timeSlot, setTimeSlot] = useState("");
  const [orderType, setOrderType] = useState("pickup");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!pickupDate) return setAvailableSlots([]);
      const ref = doc(db, "timeSlots", pickupDate);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setAvailableSlots(snap.data().slots || []);
      } else {
        setAvailableSlots([]);
      }
    };
    fetchSlots();
  }, [pickupDate]);

  const handleRemove = (index) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
  };

  const total = cart.reduce(
    (sum, item) => sum + ((item.price ?? 0) * (item.quantity ?? 1)),
    0
  );

  const submitOrder = async () => {
    if (!pickupDate || !timeSlot) return alert("Date and Time required.");
    if (orderType === "delivery" && !address.trim()) return alert("Enter address.");
    const newOrderId = `ORD-${uuidv4().slice(0, 8).toUpperCase()}`;

    const order = {
      orderId: newOrderId,
      userId: user.uid,
      userEmail: user.email,
      cart,
      total,
      date: pickupDate,
      timeSlot,
      orderType,
      address: orderType === "delivery" ? address : "",
      paymentMethod,
      createdAt: new Date(),
    };

    await addDoc(collection(db, "orders"), order);

    // Convert cart to a readable string
const itemSummary = cart.map(i => `${i.name} x${i.quantity || 1}`).join(", ");

emailjs.send(
  'service_0cxwyha',             // your service ID
  'template_uoarlno',            // your template ID
  {
    user_email: user.email,
    order_id: newOrderId,
    order_total: total.toFixed(2),
    pickup_date: pickupDate,
    time_slot: timeSlot,
    order_type: orderType,
    payment_method: paymentMethod,
    address: orderType === "delivery" ? address : "N/A",
    order_items: itemSummary
  },
  'mxAMf8U5mgzskwU7z'            // your PUBLIC KEY
)


    // OPTIONAL: send mail to boss here (next step)
    // sendOrderEmailToBoss(order)

    setOrderId(newOrderId);
    setOrderSuccess(true);
    localStorage.removeItem("cart");
  };

  if (orderSuccess) {
    return (
      <div className="container">
        <h2>🎉 Order Successful!</h2>
        <p>Your order ID: <strong>{orderId}</strong></p>
        <p>We'll process your order shortly.</p>
        <button className="button" onClick={() => navigate("/dashboard")}>Back to Menu</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Your Cart</h2>

      {cart.length === 0 ? (
  <div style={{ textAlign: "center" }}>
    <p><em>Your cart is empty.</em></p>
    <button className="button" onClick={() => navigate("/dashboard")}>
      🔙 Back to Menu
    </button>
  </div>
) : (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td>{item.quantity || 1}</td>
                  <td>${(item.price ?? 0).toFixed(2)}</td>
                  <td>${((item.price ?? 0) * (item.quantity ?? 1)).toFixed(2)}</td>
                  <td>
                    <button
                      onClick={() => handleRemove(idx)}
                      style={{ color: "red", border: "none", background: "none" }}
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 style={{ textAlign: "right", marginTop: "1rem" }}>
            Total: ${total.toFixed(2)}
          </h3>

          <hr />

          <h4>Order Preferences</h4>

          <label>Pickup or Delivery:</label>
          <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
            <option value="pickup">Pickup</option>
            <option value="delivery">Delivery</option>
          </select>

          {orderType === "delivery" && (
            <>
              <label>Delivery Address:</label>
              <input
                type="text"
                placeholder="Enter delivery address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </>
          )}

          <label>Date:</label>
          <input
            type="date"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
          />

          <label>Time Slot:</label>
          <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
            <option value="">-- Select --</option>
            {availableSlots.length > 0 ? (
              availableSlots.map((slot, idx) => (
                <option key={idx} value={slot}>{slot}</option>
              ))
            ) : (
              <option disabled>No slots</option>
            )}
          </select>

          <label>Payment Method:</label>
          <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="Cash">Cash</option>
            <option value="Credit Card">Visa</option>
          </select>

          <div style={{ marginTop: "1rem", textAlign: "right" }}>
  <button
    className="button"
    onClick={submitOrder}
    disabled={cart.length === 0}
    style={{ opacity: cart.length === 0 ? 0.5 : 1, cursor: cart.length === 0 ? "not-allowed" : "pointer" }}
  >
    Proceed to Checkout
  </button>
</div>

          <div style={{ marginTop: "2rem", textAlign: "left" }}>
  <button className="button button-secondary" onClick={() => navigate("/dashboard")}>
    ← Back to Menu
  </button>
</div>

        </>
      )}
    </div>
  );
}
