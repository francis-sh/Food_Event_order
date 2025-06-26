import React, { useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";

export default function SeedMenu() {
  useEffect(() => {
    const seed = async () => {
      const items = [
        {
          name: "Caviar Sandwich",
          description: "Rich caviar with fresh herbs.",
          image: "https://images.unsplash.com/photo-1585238342028-3bd2157b9e77"
        },
        {
          name: "Beef Tartar",
          description: "Raw minced steak with quail egg.",
          image: "https://images.unsplash.com/photo-1550418290-a8d86ad674d4"
        },
        {
          name: "Mini Sliders",
          description: "Small beef burgers with toppings.",
          image: "https://images.unsplash.com/photo-1562967916-eb82221dfb44"
        },
        {
          name: "Chicken Skewers",
          description: "Spiced grilled chicken on sticks.",
          image: "https://images.unsplash.com/photo-1625941056399-8f2c6173bde2"
        },
        {
          name: "Vegan Sushi",
          description: "Avocado, tofu, and cucumber rolls.",
          image: "https://images.unsplash.com/photo-1579880704325-ec3f30e2dbdf"
        }
        // Add more items if needed
      ];

      for (const item of items) {
        await addDoc(collection(db, "menuItems"), item);
      }

      alert("Menu seeded!");
    };

    seed();
  }, []);

  return <div>Seeding menu...</div>;
}
