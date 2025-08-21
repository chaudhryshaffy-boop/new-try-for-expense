import { Link, Route, Routes } from 'react-router-dom'
import './App.css'
import { useHealthQuery } from './app/api'

function Layout() {
	return (
		<div className="min-h-screen bg-gray-50 text-gray-900">
			<header className="border-b bg-white">
				<div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
					<Link to="/" className="text-xl font-semibold">FinDash</Link>
					<nav className="flex gap-4 text-sm">
						<Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
						<Link to="/transactions" className="hover:text-blue-600">Transactions</Link>
						<Link to="/budgets" className="hover:text-blue-600">Budgets</Link>
						<Link to="/settings" className="hover:text-blue-600">Settings</Link>
					</nav>
				</div>
			</header>
			<main className="mx-auto max-w-7xl px-4 py-6">
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/dashboard" element={<Dashboard />} />
					<Route path="/transactions" element={<Transactions />} />
					<Route path="/budgets" element={<Budgets />} />
					<Route path="/settings" element={<Settings />} />
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

function Dashboard() {
	return <div className="text-gray-700">Dashboard coming soon…</div>
}
function Transactions() {
	return <div className="text-gray-700">Transactions coming soon…</div>
}
function Budgets() {
	return <div className="text-gray-700">Budgets coming soon…</div>
}
function Settings() {
	return <div className="text-gray-700">Settings coming soon…</div>
}

function App() {
	return <Layout />
}

export default App
