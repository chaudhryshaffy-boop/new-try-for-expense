import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Login() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();
	const location = useLocation() as any;

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		const { error } = await supabase.auth.signInWithPassword({ email, password });
		setLoading(false);
		if (error) {
			setError(error.message);
			return;
		}
		navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
	}

	return (
		<div className="mx-auto max-w-md py-10">
			<h1 className="text-2xl font-semibold mb-6">Login</h1>
			<form onSubmit={onSubmit} className="space-y-4">
				<input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
				<input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
				{error && <div className="text-red-600 text-sm">{error}</div>}
				<button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">{loading ? 'Signing in…' : 'Sign in'}</button>
			</form>
			<p className="text-sm text-gray-600 mt-4">No account? <Link to="/register" className="text-blue-600">Register</Link></p>
		</div>
	);
}