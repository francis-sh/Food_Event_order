import React, { useState, useEffect } from "react";
import Card from "./components/ui/Card";
import Button from "./components/ui/Button";
import Input from "./components/ui/Input";
import Calendar from "./components/ui/Calendar";
import { format } from "date-fns";
import { db, auth } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";

export default function FoodOrderingApp() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [cart, setCart] = useState([]);
  const [adminMode, setAdminMode] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const [authForm, setAuthForm] = useState({ email: "", password: "" });
  const [ordersForSelectedDate, setOrdersForSelectedDate] = useState([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMenu();
      if (user.email === "francsha@admin.com") {
        setAdminMode(true);
        fetchOrders();
      } else {
        setAdminMode(false);
        setOrders([]);
      }
    } else {
      setAdminMode(false);
      setMenuItems([]);
      setOrders([]);
      setCart([]);
    }
  }, [user]);

  // Load menu items from Firestore
  const fetchMenu = async () => {
    const snap = await getDocs(collection(db, "menuItems"));
    setMenuItems(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  // Load all orders from Firestore (admin only)
  const fetchOrders = async () => {
    const snap = await getDocs(collection(db, "orders"));
    const data = snap.docs.map((doc) => {
      const order = doc.data();
      return {
        id: doc.id,
        userEmail: order.userEmail || "unknown",
        paymentMethod: order.paymentMethod || "cash",
        cart: order.cart || [],
        date: order.date,
        createdAtDate: order.createdAt?.toDate ? order.createdAt.toDate() : null,
      };
    });
    setOrders(data);
  };

  // Add item to cart
  const addToCart = (item) => {
    setCart([...cart, { ...item, customIngredients: [...(item.baseIngredients || [])] }]);
  };

  // Remove item from cart by index
  const removeFromCart = (id) => {
    setCart(cart.filter((_, index) => index !== id));
  };

  // Update ingredients in cart item
  const updateIngredients = (itemIndex, ingredient) => {
    const newCart = [...cart];
    const idx = newCart[itemIndex].customIngredients.indexOf(ingredient);
    if (idx > -1) newCart[itemIndex].customIngredients.splice(idx, 1);
    else newCart[itemIndex].customIngredients.push(ingredient);
    setCart(newCart);
  };

  // Submit order (adds to Firestore)
  const submitOrder = async () => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    await addDoc(collection(db, "orders"), {
      userId: user?.uid || "guest",
      userEmail: user?.email || "guest",
      cart,
      date: format(selectedDate, "yyyy-MM-dd"),
      createdAt: new Date(),
      paymentMethod: "cash",
    });
    alert("Order placed!");
    setCart([]);
  };

  // Login handler (only allow francsha@admin.com and password 123456 for admin)
  const handleLogin = () => {
    if (
      authForm.email === "francsha@admin.com" &&
      authForm.password === "123456"
    ) {
      signInWithEmailAndPassword(auth, authForm.email, authForm.password).catch(
        (err) => alert(err.message)
      );
    } else {
      signInWithEmailAndPassword(auth, authForm.email, authForm.password).catch(
        (err) => alert(err.message)
      );
    }
  };

  // Register handler (any user can register)
  const handleRegister = () => {
    createUserWithEmailAndPassword(auth, authForm.email, authForm.password).catch(
      (err) => alert(err.message)
    );
  };

  // Unique order dates for highlighting in calendar
  const orderDates = [...new Set(orders.map((o) => o.date))];

  // When admin selects a date, filter orders for that day
  const handleAdminDateSelect = (date) => {
    setSelectedDate(date);
    const dateStr = format(date, "yyyy-MM-dd");
    setOrdersForSelectedDate(orders.filter((o) => o.date === dateStr));
  };

  // Style dates with orders (bold + background)
  const dateClassName = (date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    if (orderDates.includes(dateStr)) {
      return "font-semibold text-blue-600 bg-yellow-200 rounded-lg";
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-yellow-50 p-6 font-sans">
      {/* Login/Register when no user */}
      {!user ? (
        <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200">
          <h1 className="text-3xl font-extrabold mb-6 text-center text-indigo-700">
            Welcome to Event Food Ordering
          </h1>
          <Input
            placeholder="Email"
            value={authForm.email}
            onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
            className="mb-5 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Input
            placeholder="Password"
            type="password"
            value={authForm.password}
            onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
            className="mb-8 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-4">
            <Button
              onClick={handleLogin}
              className="flex-1 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition"
            >
              Login
            </Button>
            <Button
              variant="secondary"
              onClick={handleRegister}
              className="flex-1 border border-indigo-600 text-indigo-600 font-semibold rounded-lg shadow hover:bg-indigo-50 transition"
            >
              Register
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <header className="flex justify-between items-center mb-8 max-w-7xl mx-auto">
            <h1 className="text-4xl font-extrabold text-indigo-700 tracking-wide">
              Event Food Ordering
            </h1>
            <div className="flex items-center gap-6 text-gray-700">
              <span className="font-medium">{user.email}</span>
              <Button
                variant="secondary"
                className="py-2 px-4 rounded-lg hover:bg-gray-100 transition"
                onClick={() => signOut(auth)}
              >
                Logout
              </Button>
              {user.email === "francsha@admin.com" && (
                <Button
                  variant="outline"
                  className="py-2 px-4 rounded-lg border-indigo-600 border text-indigo-600 hover:bg-indigo-50 transition"
                  onClick={() => setAdminMode(!adminMode)}
                >
                  {adminMode ? "Switch to User Mode" : "Switch to Admin Mode"}
                </Button>
              )}
            </div>
          </header>

          {/* Main content */}
          <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Menu items (only visible for normal user or admin in user mode) */}
            {(!adminMode || user.email !== "francsha@admin.com") && (
              <section className="md:col-span-2 space-y-6">
                <h2 className="text-3xl font-semibold text-gray-800 mb-6 border-b border-indigo-200 pb-2">
                  Menu
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {menuItems.map((item) => (
                    <Card
                      key={item.id}
                      item={item}
                      addToCart={addToCart}
                      isDateAvailable={() => true}
                      className="shadow-lg hover:shadow-2xl transition rounded-lg"
                    />
                  ))}
                </div>
              </section>
            )}

            {/* User Cart (only normal user) */}
            {!adminMode && (
              <aside className="bg-white rounded-xl shadow-lg p-6 sticky top-10 max-h-[80vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-5 border-b border-indigo-300 pb-2">
                  Your Cart
                </h2>
                {cart.length === 0 ? (
                  <p className="text-gray-500">No items in cart.</p>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item, index) => (
                      <Card
                        key={index}
                        item={item}
                        index={index}
                        cartMode
                        updateIngredients={updateIngredients}
                        removeFromCart={removeFromCart}
                        className="shadow-md rounded-lg"
                      />
                    ))}
                    <div className="mt-6">
                      <h3 className="text-xl font-semibold mb-3">Pickup Date</h3>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-lg shadow-inner"
                      />
                      <p className="mt-2 text-gray-700 font-medium">
                        Selected: {format(selectedDate, "PPP")}
                      </p>
                      <Button
                        className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                        onClick={submitOrder}
                      >
                        Submit Order
                      </Button>
                      <Button
                        className="mt-3 w-full border border-gray-300 text-gray-500 py-3 rounded-lg cursor-not-allowed"
                        disabled
                      >
                        Pay with Stripe (Coming Soon)
                      </Button>
                    </div>
                  </div>
                )}
              </aside>
            )}

            {/* Admin Mode: Orders Calendar + Orders List */}
            {adminMode && user.email === "francsha@admin.com" && (
              <section className="bg-white rounded-xl shadow-lg p-6 max-h-[80vh] overflow-y-auto">
                <h2 className="text-3xl font-semibold mb-4 border-b border-indigo-300 pb-2">
                  Orders Calendar
                </h2>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleAdminDateSelect}
                  dateClassName={dateClassName}
                  className="rounded-lg shadow-inner mb-6"
                />
                {ordersForSelectedDate.length === 0 ? (
                  <p className="text-gray-600 text-lg">
                    No orders on {format(selectedDate, "PPP")}.
                  </p>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold mb-3">
                      Orders for {format(selectedDate, "PPP")}
                    </h3>
                    <table className="w-full table-auto border-collapse border border-gray-300 rounded-md overflow-hidden">
                      <thead className="bg-indigo-100">
                        <tr>
                          <th className="border border-gray-300 px-4 py-2 text-left">User Email</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Items</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Payment Method</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ordersForSelectedDate.map((order, idx) => (
                          <tr
                            key={order.id}
                            className={idx % 2 === 0 ? "bg-white" : "bg-indigo-50 hover:bg-indigo-100 transition"}
                          >
                            <td className="border border-gray-300 px-4 py-2 align-top">{order.userEmail}</td>
                            <td className="border border-gray-300 px-4 py-2 align-top max-w-xs whitespace-normal">
                              {order.cart
                                .map(
                                  (item) =>
                                    `${item.name} (${item.customIngredients?.join(", ") || item.baseIngredients?.join(", ")})`
                                )
                                .join("; ")}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 align-top">{order.paymentMethod}</td>
                            <td className="border border-gray-300 px-4 py-2 align-top">
                              {order.createdAtDate
                                ? order.createdAtDate.toLocaleString()
                                : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </section>
            )}
          </main>
        </>
      )}
    </div>
  );
}
