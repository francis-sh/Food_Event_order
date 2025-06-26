// src/utils/seedMenu.js
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

const menuItems = [
  {
    name: "Caviar Sandwich",
    description: "Premium sandwich with caviar and fresh herbs.",
    image: "https://images.unsplash.com/photo-1604908554160-2fd1e3efc539?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Burger",
    description: "Classic cheeseburger with lettuce and tomato.",
    image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Pizza",
    description: "Stone-baked pizza with mozzarella and basil.",
    image: "https://images.unsplash.com/photo-1548365328-9ec8c35da1a7?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Sushi Platter",
    description: "Assorted sushi with wasabi and soy sauce.",
    image: "https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Pasta Bowl",
    description: "Creamy Alfredo pasta with parmesan cheese.",
    image: "https://images.unsplash.com/photo-1589308078055-724b3b5f47fa?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Salad",
    description: "Fresh mixed greens with vinaigrette dressing.",
    image: "https://images.unsplash.com/photo-1566843972257-72ec60f82cdd?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Taco",
    description: "Spicy beef tacos with salsa and sour cream.",
    image: "https://images.unsplash.com/photo-1601924928580-46c6df14cba4?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Fried Chicken",
    description: "Crispy fried chicken served with hot sauce.",
    image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Donut",
    description: "Glazed donut with rainbow sprinkles.",
    image: "https://images.unsplash.com/photo-1587653051621-dc9e0b52c1db?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Coffee",
    description: "Fresh brewed coffee served hot.",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=500&q=80",
  }
];

export const seedMenu = async () => {
  const menuRef = collection(db, "menuItems");
  for (let item of menuItems) {
    await addDoc(menuRef, item);
    console.log(`Added: ${item.name}`);
  }
  alert("Menu items added successfully!");
};
