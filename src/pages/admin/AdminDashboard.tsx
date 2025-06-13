
import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ShoppingBag, Users, TrendingUp, Package, UserCheck, Clock, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AdminLayout from './components/AdminLayout';

const AdminDashboard = () => {
  // Mock dashboard data with Rs currency
  const dashboardData = {
    totalOrders: 128,
    ordersToday: 24,
    totalRevenue: 124800,
    revenueToday: 24000,
    totalUsers: 350,
    newUsersToday: 8,
    pendingOrders: 12,
    lowStockItems: 5,
    refundsProcessed: 8,
    refundAmount: 15600,
  };

  const handleRefund = (orderId: string) => {
    // Refund logic would go here
    console.log(`Processing refund for order: ${orderId}`);
    alert(`Refund processed for order ${orderId}`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Dashboard Overview</h1>
          <p className="text-gray-500">Welcome back, Admin</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold">{dashboardData.totalOrders}</div>
                  <p className="text-xs text-green-600">+{dashboardData.ordersToday} today</p>
                </div>
                <ShoppingBag className="h-8 w-8 text-green-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold">Rs {dashboardData.totalRevenue}</div>
                  <p className="text-xs text-green-600">+Rs {dashboardData.revenueToday} today</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold">{dashboardData.totalUsers}</div>
                  <p className="text-xs text-green-600">+{dashboardData.newUsersToday} today</p>
                </div>
                <Users className="h-8 w-8 text-green-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Pending Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold">{dashboardData.pendingOrders}</div>
                  <p className="text-xs text-amber-600">Needs attention</p>
                </div>
                <Clock className="h-8 w-8 text-amber-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Refund Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Refunds Processed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold">{dashboardData.refundsProcessed}</div>
                  <p className="text-xs text-blue-600">Rs {dashboardData.refundAmount} total</p>
                </div>
                <RotateCcw className="h-8 w-8 text-blue-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">Order #ORD123456{index}</p>
                      <p className="text-xs text-gray-500">June {6-index}, 2025 • Rs {Math.floor(Math.random() * 5000) + 1000}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        index % 3 === 0 ? 'bg-amber-100 text-amber-700' :
                        index % 3 === 1 ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {index % 3 === 0 ? 'Pending' : index % 3 === 1 ? 'Delivered' : 'Dispatched'}
                      </span>
                      {index % 3 === 1 && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRefund(`ORD123456${index}`)}
                          className="text-xs"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Refund
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <Link to="/admin-orders">
                  <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                    View all orders
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
          
          {/* Inventory Alerts */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Inventory Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((index) => (
                  <div key={index} className="flex justify-between items-center border-b pb-2">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-md mr-3"></div>
                      <div>
                        <p className="font-medium">Product Name {index}</p>
                        <p className="text-xs text-gray-500">SKU: PRD123{index}</p>
                      </div>
                    </div>
                    <span className="text-red-600 font-medium">
                      {index * 2} left
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <Link to="/admin-products">
                  <button className="text-sm text-green-600 hover:text-green-700 font-medium">
                    Manage inventory
                  </button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
