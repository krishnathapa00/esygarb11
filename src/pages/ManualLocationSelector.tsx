import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const ManualLocationSelector = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  // Sample locations - in real app, these would come from API
  const popularLocations = [
    'Thamel, Kathmandu',
    'Patan Durbar Square, Lalitpur',
    'Bhaktapur Durbar Square',
    'New Road, Kathmandu',
    'Durbarmarg, Kathmandu',
    'Kupondole, Lalitpur',
    'Sankhamul, Kathmandu',
    'Jawalakhel, Lalitpur'
  ];

  const filteredLocations = popularLocations.filter(location =>
    location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    localStorage.setItem('selectedLocation', location);
    toast({
      title: "Location Selected",
      description: `Delivery location set to ${location}`,
    });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 bg-background border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">Select Delivery Location</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search for area, locality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Current Location Button */}
        <Card>
          <CardContent className="p-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      const { latitude, longitude } = position.coords;
                      const location = `Current Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
                      handleLocationSelect(location);
                    },
                    () => {
                      toast({
                        title: "Location Access Denied",
                        description: "Please enable location access or select manually",
                        variant: "destructive"
                      });
                    }
                  );
                } else {
                  toast({
                    title: "Location Not Supported",
                    description: "Please select location manually",
                    variant: "destructive"
                  });
                }
              }}
            >
              <MapPin className="h-4 w-4 text-primary" />
              <div className="text-left">
                <div className="font-medium">Use Current Location</div>
                <div className="text-sm text-muted-foreground">Enable location to detect automatically</div>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Popular Locations */}
        <div className="space-y-3">
          <h2 className="font-semibold text-foreground">Popular Locations</h2>
          <div className="space-y-2">
            {filteredLocations.map((location, index) => (
              <Card key={index}>
                <CardContent className="p-0">
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-4 h-auto"
                    onClick={() => handleLocationSelect(location)}
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground mr-3" />
                    <div className="text-left">
                      <div className="font-medium">{location}</div>
                      <div className="text-sm text-muted-foreground">Available for delivery</div>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Custom Address Input */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-medium">Enter Custom Address</h3>
            <Input
              placeholder="Type your full address..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  handleLocationSelect(e.currentTarget.value.trim());
                }
              }}
            />
            <p className="text-sm text-muted-foreground">
              Press Enter to confirm your address
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManualLocationSelector;