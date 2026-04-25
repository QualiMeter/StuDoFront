import { CheckCircle, Brain, Zap, ShieldCheck, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
	const navigate = useNavigate();

	return (
		<div className="pt-28 pb-16 px-4 max-w-5xl mx-auto">
			<section className="text-center mb-16">
				<div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium mb-4">
					<Zap size={14} /> Новая эра обучения
				</div>
				<h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
					Управляй дедлайнами.<br />
					<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">Делегируй рутину ИИ.</span>
				</h1>
				<p className="text-gray-500 max-w-2xl mx-auto text-lg mb-8">
					StuDo объединяет планирование, отслеживание прогресса и персонального ассистента в одном окне.
				</p>
				<button
					onClick={() => navigate('/tasks')}
					className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200/50 transition transform hover:scale-105"
				>
					Перейти к задачам <ArrowRight size={18} />
				</button>
			</section>

			<section className="grid md:grid-cols-3 gap-6 mb-16">
				{[
					{ icon: <Brain size={24} />, title: 'AI-контекст', desc: 'Каждый таск помнит историю обсуждений. Нейросеть учится вместе с вами.' },
					{ icon: <ShieldCheck size={24} />, title: 'Прозрачный прогресс', desc: 'Визуализация успеваемости по предметам в реальном времени.' },
					{ icon: <Clock size={24} />, title: 'Синхронизация', desc: 'Умные уведомления и авто-планирование дня перед сессией.' }
				].map((f, i) => (
					<div key={i} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
						<div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4">{f.icon}</div>
						<h3 className="text-lg font-bold mb-2">{f.title}</h3>
						<p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
					</div>
				))}
			</section>

			<section className="bg-gradient-to-br from-gray-900 to-indigo-900 rounded-3xl p-8 md:p-12 text-white mb-16">
				<h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Почему не Notion?</h2>
				<div className="grid md:grid-cols-2 gap-8">
					<ul className="space-y-4">
						{['Встроенный AI с памятью по задаче', 'Автоматический расчет прогресса', 'Готовые шаблоны для учебы'].map((t, i) => (
							<li key={i} className="flex items-center gap-3"><CheckCircle size={18} className="text-green-400" /> {t}</li>
						))}
					</ul>
					<div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
						<p className="text-sm text-gray-300 italic mb-4">"StuDo сэкономил мне 15 часов в месяц за счет того, что ИИ сам структурирует материалы."</p>
						<p className="font-medium">— Студент 3 курса</p>
					</div>
				</div>
			</section>
		</div>
	);
}