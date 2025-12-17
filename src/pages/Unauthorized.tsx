import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Unauthorized = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link to="/">
            <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
              <Home className="h-4 w-4 mr-2" />
              Go to Homepage
            </Button>
          </Link>
          
          <Link to="/auth">
            <Button variant="outline" className="w-full">
              Login as Different User
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
