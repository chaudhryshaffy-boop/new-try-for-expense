import { useSummaryQuery } from '../app/api';

export default function Dashboard() {
	const { data, isLoading, isError } = useSummaryQuery();
	if (isLoading) return <div>Loading…</div>;
	if (isError || !data) return <div>Failed to load summary.</div>;

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card title="Current Balance" value={formatCurrency(data.current_balance)} />
				<Card title="Monthly Income" value={formatCurrency(data.monthly_income)} />
				<Card title="Monthly Expenses" value={formatCurrency(data.monthly_expenses)} />
				<Card title="Savings Rate" value={`${Math.round((data.savings_rate || 0) * 100)}%`} />
			</div>

			<section>
				<h2 className="text-lg font-semibold mb-2">Expenses by Category</h2>
				<div className="bg-white border rounded p-4">
					<ul className="divide-y">
						{data.expenses_by_category.map((row: any) => (
							<li key={row.category} className="flex justify-between py-2">
								<span>{row.category}</span>
								<span>{formatCurrency(row.amount)}</span>
							</li>
						))}
					</ul>
				</div>
			</section>

			<section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<div className="bg-white border rounded p-4">
					<h3 className="font-medium mb-2">Income vs Expenses (12 mo)</h3>
					<SimpleBars data={data.income_vs_expenses} />
				</div>
				<div className="bg-white border rounded p-4">
					<h3 className="font-medium mb-2">Balance Trend</h3>
					<SimpleLine data={data.balance_trend} />
				</div>
			</section>
		</div>
	);
}

function Card({ title, value }: { title: string; value: string }) {
	return (
		<div className="bg-white border rounded p-4">
			<div className="text-sm text-gray-600">{title}</div>
			<div className="text-2xl font-semibold">{value}</div>
		</div>
	);
}

function formatCurrency(n: number) {
	return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n || 0);
}

function SimpleBars({ data }: { data: any[] }) {
	return (
		<div className="h-40 grid grid-cols-12 items-end gap-1">
			{data.map((d) => (
				<div key={d.month} className="flex flex-col items-center gap-1">
					<div title={`Income ${formatCurrency(d.income)}`} className="bg-emerald-500 w-3" style={{ height: `${Math.min(100, d.income / 10)}px` }} />
					<div title={`Expenses ${formatCurrency(d.expenses)}`} className="bg-rose-500 w-3" style={{ height: `${Math.min(100, d.expenses / 10)}px` }} />
					<div className="text-[10px] text-gray-500">{d.month.slice(5)}</div>
				</div>
			))}
		</div>
	);
}

function SimpleLine({ data }: { data: any[] }) {
	return (
		<div className="h-40">
			{/* Placeholder sparkline-like visualization */}
			<div className="flex gap-1 items-end h-full">
				{data.map((d) => (
					<div key={d.month} title={`${d.month} ${formatCurrency(d.balance)}`} className="bg-blue-500 w-2" style={{ height: `${Math.min(100, Math.max(0, d.balance)) / 10}px` }} />
				))}
			</div>
		</div>
	);
}