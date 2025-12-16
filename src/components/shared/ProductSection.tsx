import { useNavigate } from "react-router-dom";
import ProductCard, { Product } from "./ProductCard";
import { ChevronRight } from "lucide-react";

interface ProductSectionProps {
  title: string;
  slug: string;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  cartQuantityGetter: (productId: number) => number;
}

const ProductSection = ({
  title,
  slug,
  products,
  onAddToCart,
  onUpdateQuantity,
  cartQuantityGetter,
}: ProductSectionProps) => {
  const navigate = useNavigate();

  const handleViewAll = () => {
    navigate(`/subcategories/${slug}`);
  };

  return (
    <section className="mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>
        <button
          onClick={handleViewAll}
          className="flex items-center text-green-600 hover:text-green-700 font-semibold text-sm"
        >
          View All <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            cartQuantity={cartQuantityGetter(product.id)}
            onUpdateQuantity={onUpdateQuantity}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductSection;

// import { useNavigate } from "react-router-dom";
// import ProductCard, { Product } from "./ProductCard";
// import { ChevronRight } from "lucide-react";

// interface ProductSectionProps {
//   title: string;
//   slug: string;
//   products: Product[];
//   onAddToCart: (product: Product) => void;
//   onUpdateQuantity: (productId: number, quantity: number) => void;
//   cartQuantityGetter: (productId: number) => number;
// }

// const ProductSection = ({
//   title,
//   slug,
//   products,
//   onAddToCart,
//   onUpdateQuantity,
//   cartQuantityGetter,
// }: ProductSectionProps) => {
//   const navigate = useNavigate();

//   const handleViewAll = () => {
//     navigate(`/subcategories/${slug}`);
//   };

//   return (
//     <section className="mb-6">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-3 px-1">
//         <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>
//         <button
//           onClick={handleViewAll}
//           className="flex items-center text-green-600 hover:text-green-700 font-semibold text-sm"
//         >
//           View All <ChevronRight className="w-4 h-4 ml-1" />
//         </button>
//       </div>

//       <div className="relative sm:hidden">
//         <div className="flex gap-2 overflow-x-auto no-scrollbar px-0.5">
//           {products.slice(0, 12).map((product) => (
//             <div key={product.id} className="w-[140px] flex-shrink-0">
//               <ProductCard
//                 product={product}
//                 onAddToCart={onAddToCart}
//                 cartQuantity={cartQuantityGetter(product.id)}
//                 onUpdateQuantity={onUpdateQuantity}
//               />
//             </div>
//           ))}
//         </div>
//         <div className="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-white to-transparent"></div>
//       </div>

//       {/* Desktop*/}
//       <div className="hidden sm:grid grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-3">
//         {products.map((product) => (
//           <ProductCard
//             key={product.id}
//             product={product}
//             onAddToCart={onAddToCart}
//             cartQuantity={cartQuantityGetter(product.id)}
//             onUpdateQuantity={onUpdateQuantity}
//           />
//         ))}
//       </div>
//     </section>
//   );
// };

// export default ProductSection;
