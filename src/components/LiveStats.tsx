import { useEffect, useState } from 'react';
import { getPublicStats } from '../api/client';
import { BookOpen, CheckCircle2, Users, Sparkles } from 'lucide-react';

export function LiveStats() {
	const [stats, setStats] = useState({
		totalTasks: 0,
		completedTasks: 0,
		activeUsers: 0,
		aiRequestsToday: 0
	});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadStats = async () => {
			try {
				const data = await getPublicStats();
				setStats(data);
			} catch (err) {
				console.error('Failed to load stats:', err);
			} finally {
				setLoading(false);
			}
		};

		loadStats();
		// Обновляем каждые 30 секунд
		const interval = setInterval(loadStats, 30000);
		return () => clearInterval(interval);
	}, []);

	const statItems = [
		{ icon: <BookOpen size={24} />, label: "Всего задач", value: stats.totalTasks, color: "bg-blue-100 text-blue-600" },
		{ icon: <CheckCircle2 size={24} />, label: "Выполнено", value: stats.completedTasks, color: "bg-green-100 text-green-600" },
		{ icon: <Users size={24} />, label: "Активных пользователей", value: stats.activeUsers, color: "bg-purple-100 text-purple-600" },
		{ icon: <Sparkles size={24} />, label: "AI-запросов сегодня", value: stats.aiRequestsToday, color: "bg-amber-100 text-amber-600" },
	];

	if (loading) {
		return (
			<section className="py-16 px-4">
				<div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{[1, 2, 3, 4].map(i => (
						<div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm animate-pulse">
							<div className="h-12 w-12 bg-gray-200 rounded-xl mb-4" />
							<div className="h-8 bg-gray-200 rounded w-20 mb-2" />
							<div className="h-4 bg-gray-200 rounded w-32" />
						</div>
					))}
				</div>
			</section>
		);
	}

	return (
		<section className="py-16 px-4 bg-gradient-to-b from-transparent to-indigo-50/30">
			<div className="max-w-6xl mx-auto">
				<h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Статистика платформы</h2>
				<p className="text-center text-gray-500 mb-10 max-w-lg mx-auto">Актуальные данные в реальном времени</p>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{statItems.map((item, i) => (
						<div
							key={i}
							className="bg-white/80 backdrop-blur p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
						>
							<div className={`p-3 rounded-xl inline-block mb-4 ${item.color} group-hover:scale-110 transition-transform`}>
								{item.icon}
							</div>
							<p className="text-3xl font-bold text-slate-800 mb-1">
								{item.value.toLocaleString('ru-RU')}
							</p>
							<p className="text-sm text-gray-500">{item.label}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}