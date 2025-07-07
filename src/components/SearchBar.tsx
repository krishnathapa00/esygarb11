import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  initialQuery?: string;
}

const mockProductNames = [
  "Fresh Bananas",
  "Fresh Tomatoes",
  "Fresh Spinach",
  "Fresh Milk",
  "Almond Milk",
  "Organic Mangoes",
  "Brown Bread",
  "Peanut Butter",
  "Farm Eggs",
  "Greek Yogurt",
];

const SearchBar: React.FC<SearchBarProps> = ({ initialQuery = "" }) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSuggestions([]);
      return;
    }

    const filtered = mockProductNames
      .filter((item) => item.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5);
    setSuggestions(filtered);
  }, [searchQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    navigate(`/search?query=${encodeURIComponent(suggestion)}`);
    setSuggestions([]);
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

      {suggestions.length > 0 && location.pathname !== "/search" && (
        <div className="absolute top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow z-50">
          {suggestions.map((item, idx) => (
            <div
              key={idx}
              onClick={() => handleSuggestionClick(item)}
              className="px-4 py-2 hover:bg-green-50 cursor-pointer text-sm"
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
