import { useSummaryQuery } from '../app/api';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import '../lib/chart';

export default function Dashboard() {
	const { data, isLoading, isError } = useSummaryQuery();
	if (isLoading) return <div>Loading…</div>;
	if (isError || !data) return <div>Failed to load summary.</div>;

	const pieData = {
		labels: data.expenses_by_category.map((d: any) => d.category),
		datasets: [
			{
				data: data.expenses_by_category.map((d: any) => d.amount),
				backgroundColor: [
					'#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
					'#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
				],
			},
		],
	};

	const barData = {
		labels: data.income_vs_expenses.map((d: any) => d.month),
		datasets: [
			{
				label: 'Income',
				data: data.income_vs_expenses.map((d: any) => d.income),
				backgroundColor: '#10b981',
			},
			{
				label: 'Expenses',
				data: data.income_vs_expenses.map((d: any) => d.expenses),
				backgroundColor: '#ef4444',
			},
		],
	};

	const lineData = {
		labels: data.balance_trend.map((d: any) => d.month),
		datasets: [
			{
				label: 'Balance',
				data: data.balance_trend.map((d: any) => d.balance),
				borderColor: '#3b82f6',
				backgroundColor: 'rgba(59,130,246,0.2)',
				fill: true,
			},
		],
	};

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card title="Current Balance" value={formatCurrency(data.current_balance)} />
				<Card title="Monthly Income" value={formatCurrency(data.monthly_income)} />
				<Card title="Monthly Expenses" value={formatCurrency(data.monthly_expenses)} />
				<Card title="Savings Rate" value={`${Math.round((data.savings_rate || 0) * 100)}%`} />
			</div>

			<section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
				<div className="bg-white border rounded p-4">
					<h2 className="text-lg font-semibold mb-2">Expenses by Category</h2>
					<Doughnut data={pieData as any} />
				</div>
				<div className="bg-white border rounded p-4 lg:col-span-2">
					<h3 className="font-medium mb-2">Income vs Expenses (12 mo)</h3>
					<Bar data={barData as any} options={{ responsive: true, maintainAspectRatio: false }} height={200} />
				</div>
			</section>

			<section className="bg-white border rounded p-4">
				<h3 className="font-medium mb-2">Balance Trend</h3>
				<Line data={lineData as any} options={{ responsive: true, maintainAspectRatio: false }} height={240} />
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