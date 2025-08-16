// Lightweight auth context wrapper for backward compatibility
// This ensures old imports still work while we use the new AuthProvider
export { useAuthContext as useAuth } from '@/contexts/AuthProvider';