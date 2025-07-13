import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import { ArrowLeft, Star, Truck, Shield, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import ProductCard from "../components/ProductCard";

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart, cart } = useCart();

  const { data: products } = useProducts();

  const product = products?.find((p) => p.id.toString() === id);

  const [quantity, setQuantity] = useState(1);

  const totalCartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Get related products (same category, excluding current product)
  const relatedProducts = products?.filter(
    (p) => p.category === product?.category && p.id !== product?.id
  ).slice(0, 4) || [];

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <Header />
        <h2 className="text-2xl font-semibold text-red-600">
          Product not found.
        </h2>
        <Link to="/" className="mt-4 text-green-600 underline">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mr-3">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <span className="text-gray-500">Back to products</span>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="grid md:grid-cols-2 gap-8 p-6">
            {/* Product Images - Slidable */}
            <div className="relative">
              {/* Main image container */}
              <div className="relative overflow-hidden rounded-lg">
                <div className="flex transition-transform duration-300 ease-in-out">
                  <img
                    src={product.image}
                    alt={`${product.name} - Main`}
                    className="w-full h-96 object-cover flex-shrink-0"
                  />
                  <img
                    src={product.image}
                    alt={`${product.name} - Side`}
                    className="w-full h-96 object-cover flex-shrink-0"
                  />
                  <img
                    src={product.image}
                    alt={`${product.name} - Detail`}
                    className="w-full h-96 object-cover flex-shrink-0"
                  />
                </div>
                {/* Navigation dots */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  <div className="w-2 h-2 bg-white rounded-full opacity-80"></div>
                  <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                  <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                </div>
              </div>
              
              {product.discount && (
                <Badge className="absolute top-4 left-4 bg-red-500 hover:bg-red-500">
                  {product.discount}% OFF
                </Badge>
              )}
              <div className="absolute top-4 right-4 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                {product.deliveryTime}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <p className="text-gray-600">{product.weight}</p>

                <div className="flex items-center space-x-2 mt-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.floor(product.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({product.reviews} reviews)
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900">
                  Rs.{product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    Rs.{product.originalPrice}
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Benefits</h3>
                <div className="flex flex-wrap gap-2">
                  {product.benefits.map((benefit, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-green-100 text-green-700"
                    >
                      {benefit}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Truck className="h-4 w-4" />
                  <span>Fast delivery</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4" />
                  <span>Fresh guarantee</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="font-medium">Quantity:</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0"
                    >
                      -
                    </Button>
                    <span className="font-semibold mx-3">{quantity}</span>
                    <Button
                      onClick={() => setQuantity(quantity + 1)}
                      variant="outline"
                      size="sm"
                      className="w-8 h-8 p-0"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3"
                  size="lg"
                  onClick={() =>
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      weight: product.weight,
                      quantity,
                    })
                  }
                >
                  Add {quantity} to Cart - Rs.{product.price * quantity}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description & More Info */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Info className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Product Description & More Info</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed">
                  {product.description || "This is a high-quality product sourced directly from trusted suppliers. Fresh, nutritious, and perfect for your daily needs. We ensure the best quality and freshness in every product we deliver."}
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Product Details</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Weight:</span>
                      <span>{product.weight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span>{product.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Time:</span>
                      <span>{product.deliveryTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stock:</span>
                      <span className={product.inStock ? "text-green-600" : "text-red-600"}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Health Benefits</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {product.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Storage Instructions</h3>
                <p className="text-sm text-gray-600">
                  Store in a cool, dry place. For fresh products, refrigerate immediately after delivery. 
                  Best consumed within recommended time for optimal freshness and nutrition.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recommended Products</h2>
              <div className="md:hidden">
                {/* Mobile - Horizontal scroll with 3 items */}
                <div className="flex overflow-x-auto space-x-4 pb-4 scrollbar-hide">
                  {relatedProducts.slice(0, 3).map((relatedProduct) => {
                    const cartItem = cart.find(item => item.id === relatedProduct.id);
                    const cartQuantity = cartItem?.quantity || 0;
                    
                    return (
                      <ProductCard
                        key={relatedProduct.id}
                        product={relatedProduct}
                        cartQuantity={cartQuantity}
                        className="flex-shrink-0 w-40"
                        onAddToCart={() => 
                          addToCart({
                            id: relatedProduct.id,
                            name: relatedProduct.name,
                            price: relatedProduct.price,
                            image: relatedProduct.image,
                            weight: relatedProduct.weight,
                            quantity: 1,
                          })
                        }
                        onUpdateQuantity={(productId: number, quantity: number) => {
                          if (quantity <= 0) return;
                          addToCart({
                            id: relatedProduct.id,
                            name: relatedProduct.name,
                            price: relatedProduct.price,
                            image: relatedProduct.image,
                            weight: relatedProduct.weight,
                            quantity: 1,
                          });
                        }}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="hidden md:block">
                {/* Desktop - Grid view */}
                <div className="grid grid-cols-4 gap-4">
                  {relatedProducts.map((relatedProduct) => {
                    const cartItem = cart.find(item => item.id === relatedProduct.id);
                    const cartQuantity = cartItem?.quantity || 0;
                    
                    return (
                      <ProductCard
                        key={relatedProduct.id}
                        product={relatedProduct}
                        cartQuantity={cartQuantity}
                        onAddToCart={() => 
                          addToCart({
                            id: relatedProduct.id,
                            name: relatedProduct.name,
                            price: relatedProduct.price,
                            image: relatedProduct.image,
                            weight: relatedProduct.weight,
                            quantity: 1,
                          })
                        }
                        onUpdateQuantity={(productId: number, quantity: number) => {
                          if (quantity <= 0) return;
                          addToCart({
                            id: relatedProduct.id,
                            name: relatedProduct.name,
                            price: relatedProduct.price,
                            image: relatedProduct.image,
                            weight: relatedProduct.weight,
                            quantity: 1,
                          });
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;