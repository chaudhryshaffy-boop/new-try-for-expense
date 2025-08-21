import { useBudgetsQuery, useCreateBudgetMutation, useDeleteBudgetMutation } from '../app/api';
import { useForm } from 'react-hook-form';

type CreateBudgetForm = {
	name: string;
	month: string; // YYYY-MM
	amount: number;
	category_id?: number | '';
};

export default function BudgetsPage() {
	const { data: budgets, isLoading } = useBudgetsQuery();
	const [createBudget] = useCreateBudgetMutation();
	const [deleteBudget] = useDeleteBudgetMutation();
	const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CreateBudgetForm>({ defaultValues: { month: new Date().toISOString().slice(0,7) } });

	async function onSubmit(values: CreateBudgetForm) {
		await createBudget({ ...values, category_id: values.category_id || undefined });
		reset({ name: '', month: new Date().toISOString().slice(0,7), amount: 0 } as any);
	}

	return (
		<div className="space-y-6">
			<h1 className="text-2xl font-semibold">Budgets</h1>

			<form onSubmit={handleSubmit(onSubmit)} className="bg-white border rounded p-4 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
				<div>
					<label className="block text-xs text-gray-600 mb-1">Name</label>
					<input className="border rounded px-3 py-2 w-full" {...register('name', { required: true })} />
				</div>
				<div>
					<label className="block text-xs text-gray-600 mb-1">Month</label>
					<input type="month" className="border rounded px-3 py-2 w-full" {...register('month', { required: true })} />
				</div>
				<div>
					<label className="block text-xs text-gray-600 mb-1">Amount</label>
					<input type="number" step="0.01" className="border rounded px-3 py-2 w-full" {...register('amount', { required: true, valueAsNumber: true })} />
				</div>
				<div>
					<label className="block text-xs text-gray-600 mb-1">Category (optional)</label>
					<input className="border rounded px-3 py-2 w-full" placeholder="Category ID" {...register('category_id' as const)} />
				</div>
				<div>
					<button disabled={isSubmitting} className="bg-blue-600 text-white px-4 py-2 rounded w-full">Add</button>
				</div>
			</form>

			<div className="bg-white border rounded overflow-hidden">
				<table className="w-full text-sm">
					<thead>
						<tr className="text-left border-b">
							<th className="p-2">Name</th>
							<th className="p-2">Month</th>
							<th className="p-2">Amount</th>
							<th className="p-2">Spent</th>
							<th className="p-2">Progress</th>
							<th className="p-2">Actions</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr><td className="p-2" colSpan={6}>Loading…</td></tr>
						) : budgets?.map((b: any) => (
							<tr key={b.id} className="border-b">
								<td className="p-2">{b.name}</td>
								<td className="p-2">{b.month}</td>
								<td className="p-2">{formatCurrency(b.amount)}</td>
								<td className="p-2">{formatCurrency(b.spent)}</td>
								<td className="p-2">
									<Progress value={b.progress} status={b.status} />
								</td>
								<td className="p-2"><button className="text-rose-600" onClick={() => deleteBudget(b.id)}>Delete</button></td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

function Progress({ value, status }: { value: number; status: string }) {
	const pct = Math.min(100, Math.round((value || 0) * 100));
	const color = status === 'critical' ? 'bg-rose-500' : status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500';
	return (
		<div className="w-56 bg-gray-100 rounded h-2">
			<div className={`${color} h-2 rounded`} style={{ width: `${pct}%` }} />
		</div>
	);
}

function formatCurrency(n: number) {
	return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n || 0);
}