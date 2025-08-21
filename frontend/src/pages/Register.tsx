import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';

export default function Register() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	async function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		setError(null);
		setMessage(null);
		setLoading(true);
		const { error } = await supabase.auth.signUp({ email, password });
		setLoading(false);
		if (error) {
			setError(error.message);
			return;
		}
		setMessage('Check your email to confirm your account.');
	}

	return (
		<div className="mx-auto max-w-md py-10">
			<h1 className="text-2xl font-semibold mb-6">Register</h1>
			<form onSubmit={onSubmit} className="space-y-4">
				<input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
				<input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
				{message && <div className="text-green-700 text-sm">{message}</div>}
				{error && <div className="text-red-600 text-sm">{error}</div>}
				<button disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">{loading ? 'Creating…' : 'Create account'}</button>
			</form>
			<p className="text-sm text-gray-600 mt-4">Already have an account? <Link to="/login" className="text-blue-600">Login</Link></p>
		</div>
	);
}