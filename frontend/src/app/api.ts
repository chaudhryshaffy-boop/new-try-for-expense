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
	tagTypes: ['User', 'Transaction', 'Category', 'Budget', 'Account', 'Report', 'Portfolio', 'Summary'],
	endpoints: (builder) => ({
		health: builder.query<{ status: string }, void>({
			query: () => ({ url: 'health' }),
		}),
		accounts: builder.query<any[], void>({
			query: () => ({ url: 'accounts' }),
			providesTags: ['Account'],
		}),
		createAccount: builder.mutation<any, Partial<any>>({
			query: (body) => ({ url: 'accounts', method: 'POST', body }),
			invalidatesTags: ['Account', 'Summary'],
		}),
		categories: builder.query<any[], void>({
			query: () => ({ url: 'categories' }),
			providesTags: ['Category'],
		}),
		createCategory: builder.mutation<any, Partial<any>>({
			query: (body) => ({ url: 'categories', method: 'POST', body }),
			invalidatesTags: ['Category'],
		}),
		summary: builder.query<any, void>({
			query: () => ({ url: 'summary' }),
			providesTags: ['Summary'],
		}),
		transactions: builder.query<any[], { params?: Record<string, any> } | void>({
			query: (arg) => ({ url: 'transactions', params: arg?.params }),
			providesTags: ['Transaction', 'Summary'],
		}),
		createTransaction: builder.mutation<any, Partial<any>>({
			query: (body) => ({ url: 'transactions', method: 'POST', body }),
			invalidatesTags: ['Transaction', 'Summary'],
		}),
		updateTransaction: builder.mutation<any, { id: number; body: Partial<any> }>({
			query: ({ id, body }) => ({ url: `transactions/${id}`, method: 'PUT', body }),
			invalidatesTags: ['Transaction', 'Summary'],
		}),
		deleteTransaction: builder.mutation<{ ok: boolean }, number>({
			query: (id) => ({ url: `transactions/${id}`, method: 'DELETE' }),
			invalidatesTags: ['Transaction', 'Summary'],
		}),
	}),
});

export const { useHealthQuery, useAccountsQuery, useCreateAccountMutation, useCategoriesQuery, useCreateCategoryMutation, useSummaryQuery, useTransactionsQuery, useCreateTransactionMutation, useUpdateTransactionMutation, useDeleteTransactionMutation } = api;