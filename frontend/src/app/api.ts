import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const baseUrl = (import.meta.env.VITE_API_URL as string) || '/api';

export const api = createApi({
	reducerPath: 'api',
	baseQuery: fetchBaseQuery({ baseUrl }),
	tagTypes: ['User', 'Transaction', 'Category', 'Budget', 'Account', 'Report', 'Portfolio'],
	endpoints: (builder) => ({
		health: builder.query<{ status: string }, void>({
			query: () => ({ url: 'health' }),
		}),
	}),
});

export const { useHealthQuery } = api;