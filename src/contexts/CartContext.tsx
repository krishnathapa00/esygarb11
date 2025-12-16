import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
} from "react";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  weight: string;
  quantity: number;
  category_id: number;
}

type CartState = CartItem[];

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "UPDATE_QUANTITY"; payload: { id: number; quantity: number } }
  | { type: "REMOVE_ITEM"; payload: number }
  | { type: "RESET_CART" }
  | { type: "MERGE_CART"; payload: CartItem[] };

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  resetCart: () => void;
  mergeGuestCart: (guestCart: CartItem[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.find((item) => item.id === action.payload.id);
      if (existing) {
        return state.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      }
      return [...state, action.payload];
    }

    case "UPDATE_QUANTITY":
      if (action.payload.quantity <= 0) {
        return state.filter((item) => item.id !== action.payload.id);
      }
      return state.map((item) =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

    case "REMOVE_ITEM":
      return state.filter((item) => item.id !== action.payload);

    case "RESET_CART":
      return [];

    case "MERGE_CART": {
      const merged = [...state];
      action.payload.forEach((guestItem) => {
        const existing = merged.find((item) => item.id === guestItem.id);
        if (existing) {
          existing.quantity += guestItem.quantity;
        } else {
          merged.push(guestItem);
        }
      });
      return merged;
    }

    default:
      return state;
  }
};

const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cart, dispatch] = useReducer(cartReducer, [], () => {
    try {
      const stored = localStorage.getItem("cart");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Debounce localStorage writes to improve performance
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Debounce the save operation by 500ms
    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem("cart", JSON.stringify(cart));
    }, 500);

    // Cleanup on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [cart]);

  const addToCart = (item: CartItem) =>
    dispatch({ type: "ADD_ITEM", payload: item });
  const updateQuantity = (id: number, quantity: number) =>
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, quantity } });
  const removeItem = (id: number) =>
    dispatch({ type: "REMOVE_ITEM", payload: id });
  const resetCart = () => dispatch({ type: "RESET_CART" });
  const mergeGuestCart = (guestCart: CartItem[]) =>
    dispatch({ type: "MERGE_CART", payload: guestCart });

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeItem,
        resetCart,
        mergeGuestCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export { CartProvider, useCart };
