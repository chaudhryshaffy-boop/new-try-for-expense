import { useState } from 'react';
import { useCategoriesQuery, useTransactionsQuery, useCreateTransactionMutation, useDeleteTransactionMutation } from '../app/api';

export default function TransactionsPage() {
	const { data: categories } = useCategoriesQuery();
	const [search, setSearch] = useState('');
	const [categoryId, setCategoryId] = useState<number | ''>('');
	const { data: txs, isLoading } = useTransactionsQuery({ params: { search, category_id: categoryId || undefined } });
	const [/* createTx */, /* ignore */] = useCreateTransactionMutation();
	const [deleteTx] = useDeleteTransactionMutation();

	return (
		<div className="space-y-4">
			<h1 className="text-2xl font-semibold">Transactions</h1>
			<div className="flex gap-2">
				<input className="border rounded px-3 py-2" placeholder="Search merchant/description" value={search} onChange={(e) => setSearch(e.target.value)} />
				<select className="border rounded px-3 py-2" value={categoryId} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}>
					<option value="">All categories</option>
					{categories?.map((c: any) => (
						<option key={c.id} value={c.id}>{c.name}</option>
					))}
				</select>
			</div>
			<div className="bg-white border rounded">
				<table className="w-full text-sm">
					<thead>
						<tr className="text-left border-b">
							<th className="p-2">Date</th>
							<th className="p-2">Merchant</th>
							<th className="p-2">Description</th>
							<th className="p-2">Amount</th>
							<th className="p-2">Actions</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr><td className="p-2" colSpan={5}>Loading…</td></tr>
						) : (
							txs?.map((t: any) => (
								<tr key={t.id} className="border-b">
									<td className="p-2">{t.date}</td>
									<td className="p-2">{t.merchant || '-'}</td>
									<td className="p-2">{t.description || '-'}</td>
									<td className="p-2">{formatCurrency(t.amount)}</td>
									<td className="p-2"><button className="text-rose-600" onClick={() => deleteTx(t.id)}>Delete</button></td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function formatCurrency(n: number) {
	return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n || 0);
}