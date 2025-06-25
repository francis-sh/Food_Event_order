import React from "react";
import Button from "./Button";
import Checkbox from "./Checkbox";
import { format } from "date-fns";

export default function Card({
  item,
  adminMode = false,
  selectedDate,
  toggleDateAvailability,
  isDateAvailable,
  addToCart,
  cartMode = false,
  index,
  updateIngredients,
  removeFromCart,
}) {
  const dateStr = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";

  return (
    <div className="border rounded p-4 shadow bg-white mb-4">
      <h3 className="text-lg font-bold mb-2">{item.name}</h3>
      {item.image && (
        <img
          src={item.image}
          alt={item.name}
          className="h-40 object-cover rounded mb-2"
        />
      )}

      {!cartMode && (
        <>
          <ul className="mb-2 text-sm text-gray-700">
            {item.baseIngredients?.map((ing, i) => (
              <li key={i}>• {ing}</li>
            ))}
          </ul>

          {adminMode ? (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {dateStr
                  ? isDateAvailable(item, selectedDate)
                    ? "Available on selected date"
                    : "Unavailable on selected date"
                  : "Select a date to toggle availability"}
              </p>
              <Button
                variant="secondary"
                onClick={() => toggleDateAvailability(item, selectedDate)}
              >
                Toggle Availability for {dateStr}
              </Button>
            </div>
          ) : (
            <Button onClick={() => addToCart(item)}>Add to Cart</Button>
          )}
        </>
      )}

      {cartMode && (
        <>
          <div className="mb-2">
            <p className="text-sm font-medium">Customize Ingredients:</p>
            <div className="grid grid-cols-2 gap-1">
              {item.baseIngredients?.map((ing, i) => (
                <Checkbox
                  key={i}
                  label={ing}
                  checked={item.customIngredients?.includes(ing)}
                  onChange={() => updateIngredients(index, ing)}
                />
              ))}
            </div>
          </div>
          <Button variant="outline" onClick={() => removeFromCart(index)}>
            Remove
          </Button>
        </>
      )}
    </div>
  );
}
