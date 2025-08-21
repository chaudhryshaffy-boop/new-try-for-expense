import { Link, Route, Routes } from 'react-router-dom'
import './App.css'
import { useHealthQuery } from './app/api'
import { AuthProvider, useAuth } from './features/auth/AuthProvider'
import ProtectedRoute from './features/auth/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'

function Header() {
	const { session, signOut } = useAuth()
	return (
		<header className="border-b bg-white">
			<div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
				<Link to="/" className="text-xl font-semibold">FinDash</Link>
				<nav className="flex gap-4 text-sm items-center">
					<Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
					<Link to="/transactions" className="hover:text-blue-600">Transactions</Link>
					<Link to="/budgets" className="hover:text-blue-600">Budgets</Link>
					<Link to="/settings" className="hover:text-blue-600">Settings</Link>
					{session ? (
						<button onClick={signOut} className="ml-4 bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded">Sign out</button>
					) : (
						<Link to="/login" className="ml-4 text-blue-600">Login</Link>
					)}
				</nav>
			</div>
		</header>
	)
}

function Layout() {
	return (
		<div className="min-h-screen bg-gray-50 text-gray-900">
			<Header />
			<main className="mx-auto max-w-7xl px-4 py-6">
				<Routes>
					<Route element={<ProtectedRoute />}>
						<Route path="/" element={<Home />} />
						<Route path="/dashboard" element={<Dashboard />} />
						<Route path="/transactions" element={<Transactions />} />
						<Route path="/budgets" element={<Budgets />} />
						<Route path="/settings" element={<Settings />} />
					</Route>
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
				</Routes>
			</main>
		</div>
	)
}

function Home() {
	const { data, isLoading, isError } = useHealthQuery()
	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-semibold">Welcome to FinDash</h1>
			<div className="text-sm text-gray-600">API health: {isLoading ? 'Loading…' : isError ? 'Error' : data?.status}</div>
			<p className="text-gray-700">Use the navigation to explore the app.</p>
		</div>
	)
}

import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Budgets from './pages/Budgets'
function Settings() {
	return <div className="text-gray-700">Settings coming soon…</div>
}

function App() {
	return (
		<AuthProvider>
			<Layout />
		</AuthProvider>
	)
}

export default App
