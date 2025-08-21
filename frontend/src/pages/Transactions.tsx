import { useMemo, useState } from 'react';
import { useCategoriesQuery, useTransactionsQuery, useCreateTransactionMutation, useDeleteTransactionMutation, useAccountsQuery } from '../app/api';
import type { ColumnDef } from '@tanstack/react-table';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
	date: yup.string().required(),
	amount: yup.number().required(),
	merchant: yup.string().nullable().optional(),
	description: yup.string().nullable().optional(),
	category_id: yup.number().nullable().transform((v, o) => (o === '' ? null : v)).optional(),
	account_id: yup.number().nullable().transform((v, o) => (o === '' ? null : v)).optional(),
	currency: yup.string().default('USD').optional(),
}).required();

type FormValues = yup.InferType<typeof schema>;

export default function TransactionsPage() {
	const { data: categories } = useCategoriesQuery();
	const { data: accounts } = useAccountsQuery();
	const [search, setSearch] = useState('');
	const [categoryId, setCategoryId] = useState<number | ''>('');
	const { data: txs, isLoading } = useTransactionsQuery({ params: { search, category_id: categoryId || undefined } });
	const [createTx] = useCreateTransactionMutation();
	const [deleteTx] = useDeleteTransactionMutation();

	const columns = useMemo<ColumnDef<any>[]>(() => [
		{ header: 'Date', accessorKey: 'date' },
		{ header: 'Merchant', accessorKey: 'merchant' },
		{ header: 'Description', accessorKey: 'description' },
		{ header: 'Amount', accessorKey: 'amount', cell: ({ getValue }) => formatCurrency(Number(getValue() || 0)) },
		{ header: 'Actions', cell: ({ row }) => <button className="text-rose-600" onClick={() => deleteTx(row.original.id)}>Delete</button> },
	], [deleteTx]);

	const table = useReactTable({ data: txs || [], columns, getCoreRowModel: getCoreRowModel() });

	const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormValues>({
		resolver: yupResolver(schema) as any,
		defaultValues: { currency: 'USD', date: new Date().toISOString().slice(0, 10) } as any,
	});

	async function onSubmit(values: FormValues) {
		await createTx({ ...values });
		reset({ currency: 'USD', date: new Date().toISOString().slice(0, 10) } as any);
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Transactions</h1>

			<form onSubmit={handleSubmit(onSubmit)} className="bg-white border rounded p-4 grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
				<div>
					<label className="block text-xs text-gray-600 mb-1">Date</label>
					<input type="date" className="border rounded px-3 py-2 w-full" {...register('date')} />
				</div>
				<div>
					<label className="block text-xs text-gray-600 mb-1">Amount</label>
					<input type="number" step="0.01" className="border rounded px-3 py-2 w-full" placeholder="-12.34 for expense, 50 for income" {...register('amount')} />
				</div>
				<div>
					<label className="block text-xs text-gray-600 mb-1">Merchant</label>
					<input className="border rounded px-3 py-2 w-full" placeholder="Merchant" {...register('merchant')} />
				</div>
				<div>
					<label className="block text-xs text-gray-600 mb-1">Category</label>
					<select className="border rounded px-3 py-2 w-full" {...register('category_id' as const)}>
						<option value="">Uncategorized</option>
						{categories?.map((c: any) => (
							<option key={c.id} value={c.id}>{c.name}</option>
						))}
					</select>
				</div>
				<div>
					<label className="block text-xs text-gray-600 mb-1">Account</label>
					<select className="border rounded px-3 py-2 w-full" {...register('account_id' as const)}>
						<option value="">None</option>
						{accounts?.map((a: any) => (
							<option key={a.id} value={a.id}>{a.name}</option>
						))}
					</select>
				</div>
				<div>
					<button disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded w-full">Add</button>
				</div>
			</form>

			<div className="flex gap-2 items-center">
				<input className="border rounded px-3 py-2" placeholder="Search merchant/description" value={search} onChange={(e) => setSearch(e.target.value)} />
				<select className="border rounded px-3 py-2" value={categoryId} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}>
					<option value="">All categories</option>
					{categories?.map((c: any) => (
						<option key={c.id} value={c.id}>{c.name}</option>
					))}
				</select>
			</div>

			<div className="bg-white border rounded overflow-x-auto">
				<table className="w-full text-sm">
					<thead>
						{table.getHeaderGroups().map((hg) => (
							<tr key={hg.id} className="text-left border-b">
								{hg.headers.map((h) => (
									<th key={h.id} className="p-2">{flexRender(h.column.columnDef.header, h.getContext())}</th>
								))}
							</tr>
						))}
					</thead>
					<tbody>
						{isLoading ? (
							<tr><td className="p-2" colSpan={columns.length}>Loading…</td></tr>
						) : table.getRowModel().rows.map((row) => (
							<tr key={row.id} className="border-b">
								{row.getVisibleCells().map((cell) => (
									<td key={cell.id} className="p-2">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function formatCurrency(n: number) {
	return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n || 0);
}