import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../lib/supabaseClient';

const baseUrl = (import.meta.env.VITE_API_URL as string) || '/api';

export const api = createApi({
	reducerPath: 'api',
	baseQuery: fetchBaseQuery({
		baseUrl,
		prepareHeaders: async (headers) => {
			const { data } = await supabase.auth.getSession();
			const token = data.session?.access_token;
			if (token) headers.set('authorization', `Bearer ${token}`);
			return headers;
		},
	}),
	tagTypes: ['User', 'Transaction', 'Category', 'Budget', 'Account', 'Report', 'Portfolio'],
	endpoints: (builder) => ({
		health: builder.query<{ status: string }, void>({
			query: () => ({ url: 'health' }),
		}),
	}),
});

export const { useHealthQuery } = api;