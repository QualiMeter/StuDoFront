import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export function NotFoundPage() {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/40 text-center px-4">
			<div className="bg-indigo-100 p-4 rounded-full mb-6">
				<AlertTriangle size={48} className="text-indigo-600" />
			</div>
			<h1 className="text-6xl font-bold text-gray-800 mb-2">404</h1>
			<p className="text-xl text-gray-600 mb-8 max-w-md">Страница, которую вы ищете, не найдена или была перемещена.</p>
			<button
				onClick={() => navigate('/')}
				className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition flex items-center gap-2 shadow-lg shadow-indigo-200/50"
			>
				<Home size={18} /> На главную
			</button>
		</div>
	);
}