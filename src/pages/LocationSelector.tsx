import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, ArrowLeft, Search, Check } from 'lucide-react';
import Header from '@/components/Header';

const LocationSelector = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  // Sample popular locations
  const popularLocations = [
    'Kathmandu, Nepal',
    'Lalitpur, Nepal', 
    'Bhaktapur, Nepal',
    'Pokhara, Nepal',
    'Chitwan, Nepal',
    'Biratnagar, Nepal',
    'Birgunj, Nepal',
    'Dharan, Nepal',
    'Hetauda, Nepal',
    'Janakpur, Nepal'
  ];

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setUseCustom(false);
  };

  const handleCustomLocationToggle = () => {
    setUseCustom(!useCustom);
    if (!useCustom) {
      setSelectedLocation('');
    }
  };

  const handleConfirmLocation = () => {
    const finalLocation = useCustom ? customLocation : selectedLocation;
    if (finalLocation.trim()) {
      // Check if location is in Nepal (simple check)
      const isNepalLocation = finalLocation.toLowerCase().includes('nepal') || 
                             finalLocation.toLowerCase().includes('kathmandu') ||
                             finalLocation.toLowerCase().includes('lalitpur') ||
                             finalLocation.toLowerCase().includes('bhaktapur') ||
                             finalLocation.toLowerCase().includes('pokhara') ||
                             finalLocation.toLowerCase().includes('chitwan') ||
                             finalLocation.toLowerCase().includes('biratnagar') ||
                             finalLocation.toLowerCase().includes('birgunj') ||
                             finalLocation.toLowerCase().includes('dharan') ||
                             finalLocation.toLowerCase().includes('hetauda') ||
                             finalLocation.toLowerCase().includes('janakpur');
      
      if (!isNepalLocation && !finalLocation.toLowerCase().includes('nepal')) {
        alert('Sorry, we are not available in your city. EsyGrab currently serves Nepal only.');
        return;
      }
      
      // Save to localStorage
      try {
        localStorage.setItem(
          'esygrab_user_location',
          JSON.stringify({ address: finalLocation })
        );
        // Navigate back to previous page or home
        navigate(-1);
      } catch (error) {
        console.error('Error saving location:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="mr-3"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Select Your Location</h1>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              Choose Delivery Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Popular Locations */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Popular Locations</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {popularLocations.map((location) => (
                  <Button
                    key={location}
                    variant={selectedLocation === location ? "default" : "outline"}
                    className={`justify-between h-auto p-3 text-left ${
                      selectedLocation === location 
                        ? "bg-green-600 hover:bg-green-700" 
                        : "hover:bg-green-50"
                    }`}
                    onClick={() => handleLocationSelect(location)}
                  >
                    <span className="text-sm">{location}</span>
                    {selectedLocation === location && (
                      <Check className="h-4 w-4" />
                    )}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Location */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Custom Location</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCustomLocationToggle}
                >
                  {useCustom ? "Use Popular" : "Use Custom"}
                </Button>
              </div>
              
              {useCustom && (
                <div className="space-y-2">
                  <Label htmlFor="customLocation">Enter your location</Label>
                  <Input
                    id="customLocation"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    placeholder="Enter your full address..."
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Confirm Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button
                onClick={handleConfirmLocation}
                disabled={!selectedLocation && !customLocation.trim()}
                className="bg-green-600 hover:bg-green-700 px-8"
              >
                Confirm Location
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LocationSelector;