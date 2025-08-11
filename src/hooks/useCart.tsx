import { useCart } from "@/contexts/CartContext";

export const useCartActions = () => {
  const { cart, addToCart, updateQuantity, removeItem } = useCart();

  const handleAddToCart = (product: any) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      weight: product.weight,
      quantity: 1,
    });
  };

  // Updates the quantity of an item in the cart
  const handleUpdateQuantity = (productId: number, quantity: number) => {
    updateQuantity(productId, quantity);
  };

  // Removes an item from the cart
  const handleRemoveItem = (productId: number) => {
    removeItem(productId);
  };

  const getCartQuantity = (productId: number) => {
    return cart.find((item) => item.id === productId)?.quantity || 0;
  };

  return {
    cart,
    handleAddToCart,
    handleUpdateQuantity,
    handleRemoveItem,
    getCartQuantity,
  };
};

