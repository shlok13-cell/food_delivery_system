import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";

export interface CartItem {
  menuItemId: number;
  restaurantId: number;
  restaurantName: string;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
}

interface CartState {
  items: CartItem[];
  restaurantId: number | null;
  restaurantName: string;
}

type CartAction =
  | { type: "ADD"; item: CartItem }
  | { type: "REMOVE"; menuItemId: number }
  | { type: "SET_QTY"; menuItemId: number; quantity: number }
  | { type: "CLEAR" };

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD": {
      if (state.restaurantId && state.restaurantId !== action.item.restaurantId) {
        return { items: [action.item], restaurantId: action.item.restaurantId, restaurantName: action.item.restaurantName };
      }
      const existing = state.items.find((i) => i.menuItemId === action.item.menuItemId);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.menuItemId === action.item.menuItemId ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        };
      }
      return { ...state, restaurantId: action.item.restaurantId, restaurantName: action.item.restaurantName, items: [...state.items, action.item] };
    }
    case "REMOVE":
      return { ...state, items: state.items.filter((i) => i.menuItemId !== action.menuItemId), restaurantId: state.items.length === 1 ? null : state.restaurantId };
    case "SET_QTY":
      if (action.quantity <= 0) return reducer(state, { type: "REMOVE", menuItemId: action.menuItemId });
      return { ...state, items: state.items.map((i) => i.menuItemId === action.menuItemId ? { ...i, quantity: action.quantity } : i) };
    case "CLEAR":
      return { items: [], restaurantId: null, restaurantName: "" };
    default:
      return state;
  }
}

const STORAGE_KEY = "foodrush_cart";

interface CartContextValue {
  items: CartItem[];
  restaurantId: number | null;
  restaurantName: string;
  totalItems: number;
  totalPrice: number;
  addItem: (item: CartItem) => void;
  removeItem: (menuItemId: number) => void;
  setQty: (menuItemId: number, quantity: number) => void;
  clearCart: () => void;
  getItemQty: (menuItemId: number) => number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: [], restaurantId: null, restaurantName: "" }, (init) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : init;
    } catch {
      return init;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = state.items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items: state.items,
      restaurantId: state.restaurantId,
      restaurantName: state.restaurantName,
      totalItems,
      totalPrice,
      addItem: (item) => dispatch({ type: "ADD", item }),
      removeItem: (id) => dispatch({ type: "REMOVE", menuItemId: id }),
      setQty: (id, qty) => dispatch({ type: "SET_QTY", menuItemId: id, quantity: qty }),
      clearCart: () => dispatch({ type: "CLEAR" }),
      getItemQty: (id) => state.items.find((i) => i.menuItemId === id)?.quantity ?? 0,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
