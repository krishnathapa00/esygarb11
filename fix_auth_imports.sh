#!/bin/bash
# Quick fix script for auth imports

files=(
  "src/components/DarkstoreSelector.tsx"
  "src/components/DemoBanner.tsx" 
  "src/components/EarningsTransfer.tsx"
  "src/components/KYCSubmission.tsx"
  "src/components/KYCUpload.tsx"
  "src/pages/Checkout.tsx"
  "src/pages/DeliveryDashboard.tsx"
  "src/pages/DeliveryEarnings.tsx"
  "src/pages/DeliveryHistory.tsx"
  "src/pages/DeliveryMapNavigation.tsx"
  "src/pages/DeliveryOrders.tsx"
  "src/pages/DeliveryProfile.tsx"
  "src/pages/DeliveryWithdraw.tsx"
  "src/pages/Index.tsx"
  "src/pages/OrderHistory.tsx"
  "src/pages/OrderTracking.tsx"
  "src/pages/OrderTrackingLookup.tsx"
  "src/pages/PaymentPage.tsx"
  "src/pages/UserProfile.tsx"
  "src/pages/admin/components/AdminLayout.tsx"
)

# Update auth context imports
for file in "${files[@]}"; do
  # Replace the import line
  sed -i 's/import { useAuth } from.*AuthContext.*/import { useAuthContext } from "@\/contexts\/AuthProvider";/' "$file"
  
  # Replace useAuth() calls with useAuthContext()
  sed -i 's/useAuth(/useAuthContext(/g' "$file"
  
  # Replace logout with signOut
  sed -i 's/logout/signOut/g' "$file"
done

echo "Fixed auth imports for ${#files[@]} files"