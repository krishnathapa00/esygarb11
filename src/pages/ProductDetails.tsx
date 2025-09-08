import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import { ArrowLeft, Star, Truck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/hooks/useProducts";
import { useCartActions } from "@/hooks/useCart";
import { toast } from "@/hooks/use-toast";

const ProductDetails = () => {
  const { id } = useParams();
  const { cart, handleAddToCart } = useCartActions();

  const { data: products } = useProducts();

  const product = products?.find((p) => p.id.toString() === id);

  const [quantity, setQuantity] = useState(1);

  const totalCartQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

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
    <div className="min-h-screen bg-gray-50 pb-20">
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

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 p-6">
            {/* Product Image */}
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-96 object-contain rounded-lg"
              />
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

              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
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
                  {product.stock_quantity === 0 ? (
                    <span className="text-red-600 font-semibold text-sm">
                      Out of Stock
                    </span>
                  ) : (
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
                  )}
                </div>

                {product.stock_quantity === 0 ? (
                  <Button
                    className="w-full bg-red-100 text-red-600 py-3 text-base font-medium cursor-not-allowed"
                    size="lg"
                    disabled
                  >
                    Out of Stock
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 text-base font-medium"
                    size="lg"
                    onClick={() => {
                      handleAddToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        image: product.image,
                        weight: product.weight,
                        quantity,
                      });
                      toast({
                        title: "Added to cart",
                        description: `${quantity} x ${product.name} added to cart successfully.`,
                      });
                    }}
                  >
                    Add {quantity} to Cart - Rs.{product.price * quantity}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
