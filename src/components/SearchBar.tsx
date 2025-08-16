import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useProducts } from "@/hooks/useProducts";

interface SearchBarProps {
  initialQuery?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ initialQuery = "" }) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const { data: products = [] } = useProducts();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSuggestions([]);
      setHighlightedIndex(-1);
      return;
    }

    if (!products || products.length === 0) {
      return;
    }

    const filtered = products
      .filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((product) => product.name)
      .slice(0, 5);

    setSuggestions(filtered);
    setHighlightedIndex(-1); // reset when query changes
  }, [searchQuery, products]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected =
        highlightedIndex >= 0 ? suggestions[highlightedIndex] : searchQuery;
      navigate(`/search?query=${encodeURIComponent(selected)}`);
      setSuggestions([]);
      setHighlightedIndex(-1);
    } else if (e.key === "Escape") {
      setSuggestions([]);
      setHighlightedIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    navigate(`/search?query=${encodeURIComponent(suggestion)}`);
    setSuggestions([]);
    setHighlightedIndex(-1);
  };

  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
      <Input
        type="text"
        placeholder="Search for groceries, fruits, vegetables..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="pl-12 w-full h-12 text-base rounded-full border-gray-200 bg-gray-50 focus:bg-white focus:border-green-500 transition-all duration-200"
      />

      {suggestions.length > 0 && (
        <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow z-50">
          {suggestions.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleSuggestionClick(item)}
              className={`px-4 py-2 text-sm cursor-pointer ${
                highlightedIndex === idx ? "bg-green-100" : "hover:bg-green-50"
              }`}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
