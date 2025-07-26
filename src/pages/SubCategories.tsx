import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import ProductCard, { Product } from "@/components/ProductCard";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const subCategories = {
  1: [
    { id: 1, name: "Fruits", productCount: 45 },
    { id: 2, name: "Vegetables", productCount: 38 },
    { id: 3, name: "Dry Fruits", productCount: 22 },
    { id: 4, name: "Herbs", productCount: 15 },
    { id: 5, name: "Exotic", productCount: 18 },
  ],
  2: [
    { id: 6, name: "Milk", productCount: 25 },
    { id: 7, name: "Curd & Yogurt", productCount: 18 },
    { id: 8, name: "Paneer & Tofu", productCount: 12 },
    { id: 9, name: "Cheese", productCount: 15 },
    { id: 10, name: "Butter & Ghee", productCount: 10 },
  ],
  3: [
    { id: 11, name: "Chips & Namkeen", productCount: 35 },
    { id: 12, name: "Biscuits", productCount: 28 },
    { id: 13, name: "Cold Drinks", productCount: 20 },
    { id: 14, name: "Chocolates", productCount: 25 },
    { id: 15, name: "Ice Cream", productCount: 15 },
  ],
  4: [
    { id: 16, name: "Rice", productCount: 30 },
    { id: 17, name: "Dal & Pulses", productCount: 25 },
    { id: 18, name: "Flour", productCount: 20 },
    { id: 19, name: "Spices", productCount: 35 },
    { id: 20, name: "Oil & Ghee", productCount: 18 },
  ],
  5: [
    { id: 21, name: "Body Care", productCount: 40 },
    { id: 22, name: "Hair Care", productCount: 35 },
    { id: 23, name: "Oral Care", productCount: 25 },
    { id: 24, name: "Skin Care", productCount: 30 },
    { id: 25, name: "Feminine Care", productCount: 20 },
  ],
};

const sampleProducts: Product[] = [
  {
    id: 1,
    name: "Fresh Bananas",
    price: 40,
    originalPrice: 50,
    image:
      "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop",
    weight: "1 kg",
    discount: 20,
    deliveryTime: "8 mins",
    category: "Fruits & Vegetables",
  },
  {
    id: 2,
    name: "Organic Apples",
    price: 120,
    originalPrice: 150,
    image:
      "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=400&h=400&fit=crop",
    weight: "1 kg",
    discount: 20,
    deliveryTime: "12 mins",
    category: "Fruits & Vegetables",
  },
  {
    id: 3,
    name: "Fresh Carrots",
    price: 35,
    originalPrice: 45,
    image:
      "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400&h=400&fit=crop",
    weight: "500g",
    discount: 22,
    deliveryTime: "10 mins",
    category: "Fruits & Vegetables",
  },
  {
    id: 4,
    name: "Fresh Onions",
    price: 25,
    originalPrice: 30,
    image:
      "https://images.unsplash.com/photo-1508747703725-719777637510?w=400&h=400&fit=crop",
    weight: "1 kg",
    discount: 17,
    deliveryTime: "8 mins",
    category: "Fruits & Vegetables",
  },
  {
    id: 5,
    name: "Fresh Milk",
    price: 25,
    originalPrice: 30,
    image:
      "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop",
    weight: "500ml",
    discount: 17,
    deliveryTime: "5 mins",
    category: "Dairy & Eggs",
  },
  {
    id: 6,
    name: "Greek Yogurt",
    price: 45,
    originalPrice: 55,
    image:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop",
    weight: "200g",
    discount: 18,
    deliveryTime: "7 mins",
    category: "Dairy & Eggs",
  },
  {
    id: 7,
    name: "Farm Fresh Eggs",
    price: 60,
    originalPrice: 70,
    image:
      "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop",
    weight: "12 pieces",
    discount: 14,
    deliveryTime: "6 mins",
    category: "Dairy & Eggs",
  },
  {
    id: 8,
    name: "Paneer",
    price: 80,
    originalPrice: 95,
    image:
      "https://images.unsplash.com/photo-1631452180539-96aca7d48617?w=400&h=400&fit=crop",
    weight: "200g",
    discount: 16,
    deliveryTime: "8 mins",
    category: "Dairy & Eggs",
  },
  {
    id: 9,
    name: "Potato Chips",
    price: 20,
    originalPrice: 25,
    image:
      "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop",
    weight: "50g",
    discount: 20,
    deliveryTime: "5 mins",
    category: "Snacks & Beverages",
  },
  {
    id: 10,
    name: "Mixed Nuts",
    price: 150,
    originalPrice: 180,
    image:
      "https://images.unsplash.com/photo-1559656914-a30970c1affd?w=400&h=400&fit=crop",
    weight: "250g",
    discount: 17,
    deliveryTime: "10 mins",
    category: "Snacks & Beverages",
  },
  {
    id: 11,
    name: "Energy Drink",
    price: 45,
    originalPrice: 50,
    image:
      "https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=400&h=400&fit=crop",
    weight: "250ml",
    discount: 10,
    deliveryTime: "3 mins",
    category: "Snacks & Beverages",
  },
  {
    id: 12,
    name: "Cookies",
    price: 35,
    originalPrice: 40,
    image:
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=400&fit=crop",
    weight: "200g",
    discount: 12,
    deliveryTime: "5 mins",
    category: "Snacks & Beverages",
  },
  {
    id: 13,
    name: "Fresh Cucumber",
    price: 20,
    originalPrice: 25,
    image:
      "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&h=400&fit=crop",
    weight: "500g",
    discount: 20,
    deliveryTime: "8 mins",
    category: "Fruits & Vegetables",
  },
  {
    id: 14,
    name: "Bell Peppers",
    price: 70,
    originalPrice: 85,
    image:
      "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=400&fit=crop",
    weight: "500g",
    discount: 18,
    deliveryTime: "10 mins",
    category: "Fruits & Vegetables",
  },
];

const CategoryProducts = () => {
  const { categoryId } = useParams();
  const [selectedSubCategory, setSelectedSubCategory] = useState<number | null>(
    null
  );
  const [cartItems, setCartItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<Record<number, number>>({});

  const categorySubCategories =
    subCategories[Number(categoryId) as keyof typeof subCategories] || [];

  const categoryNames = {
    1: "Fruits & Vegetables",
    2: "Dairy & Eggs",
    3: "Snacks & Beverages",
    4: "Staples",
    5: "Personal Care",
  };

  const categoryName =
    categoryNames[Number(categoryId) as keyof typeof categoryNames] ||
    "Category";

  // Filter products by category
  const filteredProducts = sampleProducts.filter((product) => {
    if (Number(categoryId) === 1)
      return product.category === "Fruits & Vegetables";
    if (Number(categoryId) === 2) return product.category === "Dairy & Eggs";
    if (Number(categoryId) === 3)
      return product.category === "Snacks & Beverages";
    return true;
  });

  const handleAddToCart = (product: Product) => {
    setCart((prev) => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1,
    }));
    setCartItems((prev) => prev + 1);
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    setCart((prev) => {
      const newCart = { ...prev };
      const currentQty = newCart[productId] || 0;
      const diff = quantity - currentQty;

      if (quantity <= 0) {
        delete newCart[productId];
      } else {
        newCart[productId] = quantity;
      }

      setCartItems((prevTotal) => prevTotal + diff);
      return newCart;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Header Section - Fixed mobile spacing and removed sticky on mobile */}
      <div className="bg-white border-b md:sticky md:top-[128px] z-30">
        <div className="px-4 py-3">
          <div className="flex items-center">
            <Link to="/categories">
              <Button variant="ghost" size="sm" className="mr-2 p-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">
              {categoryName}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content - Adjusted height calculation for mobile */}
      <div className="flex h-[calc(100vh-180px)] md:h-[calc(100vh-208px)]">
        {/* Left Sidebar - Reduced Width */}
        <div className="w-16 sm:w-20 md:w-24 bg-white border-r border-gray-100 overflow-y-auto flex-shrink-0">
          <div className="py-2 px-1">
            {/* All Products Option */}
            <button
              onClick={() => setSelectedSubCategory(null)}
              className={`w-full mb-1.5 p-1.5 sm:p-2 rounded-lg text-center transition-all duration-200 ${
                selectedSubCategory === null
                  ? "bg-green-500 text-white shadow-md"
                  : "bg-gray-50 hover:bg-gray-100 text-gray-700"
              }`}
            >
              <div className="text-[9px] sm:text-[10px] md:text-xs font-medium leading-tight">
                All
              </div>
              <div className="text-[8px] sm:text-[9px] md:text-[10px] opacity-75 mt-0.5">
                {filteredProducts.length}
              </div>
            </button>

            {/* Subcategory Pills */}
            {categorySubCategories.map((subCategory) => (
              <button
                key={subCategory.id}
                onClick={() => setSelectedSubCategory(subCategory.id)}
                className={`w-full mb-1.5 p-1.5 sm:p-2 rounded-lg text-center transition-all duration-200 ${
                  selectedSubCategory === subCategory.id
                    ? "bg-green-500 text-white shadow-md"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                }`}
              >
                <div className="text-[9px] sm:text-[10px] md:text-xs font-medium leading-tight break-words">
                  {subCategory.name}
                </div>
                <div className="text-[8px] sm:text-[9px] md:text-[10px] opacity-75 mt-0.5">
                  {subCategory.productCount}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Content - Products Grid - More Space */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-3 sm:p-4">
            <div className="mb-3 sm:mb-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-900">
                {selectedSubCategory
                  ? categorySubCategories.find(
                      (sub) => sub.id === selectedSubCategory
                    )?.name
                  : "All Products"}{" "}
                ({filteredProducts.length})
              </h2>
            </div>

            {/* Products Grid - Bigger Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  cartQuantity={cart[product.id] || 0}
                  onUpdateQuantity={handleUpdateQuantity}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Spacer */}
      <div className="h-16 md:hidden"></div>
    </div>
  );
};

export default CategoryProducts;
