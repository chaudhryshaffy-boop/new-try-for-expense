import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export default function ProtectedRoute() {
	const { session, isLoading } = useAuth();
	const location = useLocation();
	if (isLoading) return <div className="text-sm text-gray-600">Loading…</div>;
	if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
	return <Outlet />;
}