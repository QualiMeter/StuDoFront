import { useState, useEffect } from 'react';
import { getTasks } from '../api/client';
import type { Task } from '../types';
import { CheckCircle2, XCircle, Clock, MessageSquare, Eye } from 'lucide-react';

export function MentorTaskReview() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [filter, setFilter] = useState<'all' | 'review' | 'approved' | 'rejected'>('all');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const load = async () => {
			try {
				const data = await getTasks();
				setTasks(Array.isArray(data) ? data : []);
			} catch { setTasks([]); }
			finally { setLoading(false); }
		};
		load();
	}, []);

	const filtered = tasks.filter(t => {
		if (filter === 'review') return t.status === 'in_progress';
		if (filter === 'approved') return t.status === 'done';
		if (filter === 'rejected') return t.status === 'cancelled';
		return true;
	});

	if (loading) return <div className="flex justify-center pt-10 text-gray-500">Загрузка...</div>;

	return (
		<div className="max-w-7xl mx-auto space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<h2 className="text-2xl font-bold text-slate-800">Проверка задач</h2>
				<div className="flex gap-2">
					{['all', 'review', 'approved', 'rejected'].map(f => (
						<button key={f} onClick={() => setFilter(f as any)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition capitalize ${filter === f ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-gray-200 hover:bg-gray-50'}`}>
							{f === 'all' ? 'Все' : f === 'review' ? 'На проверке' : f === 'approved' ? 'Принято' : 'Отклонено'}
						</button>
					))}
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
				{filtered.map(task => (
					<div key={task.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col gap-3">
						<div className="flex justify-between items-start">
							<h3 className="font-semibold text-slate-800 truncate">{task.title}</h3>
							{task.status === 'in_progress' && <Clock size={18} className="text-amber-500 shrink-0" />}
							{task.status === 'done' && <CheckCircle2 size={18} className="text-green-500 shrink-0" />}
							{task.status === 'cancelled' && <XCircle size={18} className="text-red-500 shrink-0" />}
						</div>
						<p className="text-sm text-gray-500 line-clamp-2">{task.description || 'Нет описания'}</p>
						<div className="flex items-center gap-2 text-xs text-gray-400">
							<span className={`px-2 py-1 rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-700' : task.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
								{task.priority}
							</span>
							{task.deadline && <span>Дедлайн: {new Date(task.deadline).toLocaleDateString()}</span>}
						</div>
						<div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
							<button className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition flex items-center justify-center gap-1"><Eye size={14} /> Проверить</button>
							<button className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1"><MessageSquare size={14} /> Комментарии</button>
						</div>
					</div>
				))}
			</div>

			{filtered.length === 0 && (
				<div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
					<CheckCircle2 size={32} className="mx-auto text-gray-300 mb-2" />
					<p className="text-gray-500">Нет задач для отображения</p>
				</div>
			)}
		</div>
	);
}