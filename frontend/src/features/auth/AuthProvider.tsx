import { createContext, useContext, useEffect, useState } from 'react';
import type { PropsWithChildren } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabaseClient';

export type AuthContextValue = {
	session: Session | null;
	isLoading: boolean;
	signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
	const [session, setSession] = useState<Session | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let isMounted = true;
		async function init() {
			const { data } = await supabase.auth.getSession();
			if (!isMounted) return;
			setSession(data.session ?? null);
			setIsLoading(false);
		}
		init();
		const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
			setSession(s);
		});
		return () => {
			isMounted = false;
			sub.subscription.unsubscribe();
		};
	}, []);

	async function signOut() {
		await supabase.auth.signOut();
	}

	return (
		<AuthContext.Provider value={{ session, isLoading, signOut }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error('useAuth must be used within AuthProvider');
	return ctx;
}