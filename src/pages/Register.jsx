import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await setDoc(doc(db, "users", userCred.user.uid), {
        uid: userCred.user.uid,
        ...form,
        role: "client",
      });
      localStorage.setItem("user", JSON.stringify(userCred.user));
      navigate("/");
    } catch (err) {
      alert("Registration failed: " + err.message);
    }
  };

  return (
    <div className="container">
      <form className="card" onSubmit={handleRegister}>
        <h2>Register</h2>
        <input className="input" placeholder="First Name" name="firstName" onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        <input className="input" placeholder="Last Name" name="lastName" onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        <input className="input" placeholder="Phone Number" name="phone" onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input className="input" placeholder="Email" name="email" type="email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="input" placeholder="Password" name="password" type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="button" type="submit">Register</button>
        <p style={{ textAlign: "center" }}>Already have an account? <a href="/login">Login</a></p>
      </form>
    </div>
  );
}
