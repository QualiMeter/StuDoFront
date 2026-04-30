import { useState, useEffect } from 'react';
import { getAdminUsers } from '../api/client';
import type { User } from '../types';
import { Search, ArrowUpDown, UserPlus, MessageSquare, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MentorStudents() {
	const navigate = useNavigate();
	const [students, setStudents] = useState<User[]>([]);
	const [search, setSearch] = useState('');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const t = setTimeout(async () => {
			try {
				const { users } = await getAdminUsers(search, 1, 50);
				setStudents(users.filter(u => u.role === 'student'));
			} catch { }
			finally { setLoading(false); }
		}, 300);
		return () => clearTimeout(t);
	}, [search]);

	if (loading) return <div className="flex justify-center pt-10 text-gray-500">Загрузка...</div>;

	return (
		<div className="max-w-7xl mx-auto space-y-6">
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
				<h2 className="text-2xl font-bold text-slate-800">Мои студенты</h2>
				<div className="relative w-full sm:w-72">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
					<input type="text" placeholder="Поиск по имени или email..." className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40" value={search} onChange={e => setSearch(e.target.value)} />
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
				{students.map(s => (
					<div key={s.id} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition flex flex-col gap-3">
						<div className="flex items-start justify-between">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-medium text-sm">{s.name[0]}{s.surname[0]}</div>
								<div>
									<h3 className="font-semibold text-slate-800">{s.surname} {s.name}</h3>
									<p className="text-xs text-gray-500">{s.email}</p>
								</div>
							</div>
							<span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">Активен</span>
						</div>
						<div className="flex items-center gap-2 text-xs text-gray-500">
							<div className="flex items-center gap-1"><BarChart2 size={12} /> Прогресс: 68%</div>
							<div className="flex items-center gap-1 ml-auto"><MessageSquare size={12} /> 3 сообщения</div>
						</div>
						<div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
							<button className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition flex items-center justify-center gap-1"><BarChart2 size={14} /> Прогресс</button>
							<button className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1"><MessageSquare size={14} /> Написать</button>
						</div>
					</div>
				))}
			</div>

			{students.length === 0 && (
				<div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
					<UserPlus size={32} className="mx-auto text-gray-300 mb-2" />
					<p className="text-gray-500">Студенты не найдены</p>
				</div>
			)}
		</div>
	);
}