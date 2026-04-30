import { useState, useEffect } from 'react';
import { Users, ClipboardCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { getAdminOverview, getAdminTasksTrend, getAdminAiUsage } from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TrendItem } from '../types';

export function MentorDashboard() {
	const [overview, setOverview] = useState<any>(null);
	const [tasksTrend, setTasksTrend] = useState<TrendItem[]>([]);
	const [aiUsage, setAiUsage] = useState<any[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			const [ov, tr, ai] = await Promise.allSettled([getAdminOverview(), getAdminTasksTrend(7), getAdminAiUsage(7)]);
			if (ov.status === 'fulfilled') setOverview(ov.value);
			if (tr.status === 'fulfilled') setTasksTrend(Array.isArray(tr.value) ? tr.value : []);
			if (ai.status === 'fulfilled') setAiUsage(Array.isArray(ai.value) ? ai.value : []);
		};
		fetchData();
	}, []);

	if (!overview) return <div className="flex justify-center pt-10 text-gray-500">Загрузка...</div>;

	return (
		<div className="max-w-7xl mx-auto space-y-6">
			<h2 className="text-2xl font-bold text-slate-800">Обзор подопечных</h2>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{[
					{ l: 'Студентов', v: overview.totalUsers, i: Users, c: 'bg-blue-100 text-blue-600' },
					{ l: 'Задач на проверке', v: overview.activeTasks, i: ClipboardCheck, c: 'bg-amber-100 text-amber-600' },
					{ l: 'Выполнено сегодня', v: overview.completionRate, i: CheckCircle2, c: 'bg-green-100 text-green-600' },
					{ l: 'AI-запросов', v: overview.aiRequestsToday, i: AlertCircle, c: 'bg-purple-100 text-purple-600' }
				].map((s, i) => (
					<div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
						<div><p className="text-sm text-gray-500">{s.l}</p><p className="text-2xl font-bold text-slate-800">{s.v?.toLocaleString() ?? 0}</p></div>
						<div className={`p-3 rounded-xl ${s.c}`}><s.i size={20} /></div>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
					<h3 className="text-lg font-bold mb-4 text-slate-800">Активность студентов</h3>
					<div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={tasksTrend}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
				</div>
				<div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
					<h3 className="text-lg font-bold mb-4 text-slate-800">Использование ИИ</h3>
					<div className="h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={aiUsage}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
				</div>
			</div>
		</div>
	);
}