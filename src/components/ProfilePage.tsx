/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Save, Loader2 } from 'lucide-react';
import { apiFetch } from '../api/client';

export function ProfilePage() {
	const { user, refreshUser } = useAuth(); // 👈 Достаём метод обновления
	const [form, setForm] = useState({ surname: '', name: '', patronym: '', email: '', password: '' });
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState('');
	const [error, setError] = useState('');

	useEffect(() => {
		if (user) {
			setForm({
				surname: user.surname || '',
				name: user.name || '',
				patronym: user.patronym || '',
				email: user.email || '',
				password: ''
			});
		}
	}, [user]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true); setError(''); setSuccess('');
		try {
			const { password, ...userData } = form;

			// Формируем тело запроса. Пароль отправляем только если он введён
			const payload = {
				...userData,
				patronym: userData.patronym || null,
				password: password.length > 0 ? password : undefined
			};

			// 1. Отправляем данные на бэкенд
			await apiFetch('/api/Auth/me', {
				method: 'PUT',
				body: JSON.stringify(payload)
			});

			// 2. Сразу обновляем контекст (без перезагрузки страницы)
			await refreshUser();

			setSuccess('Данные успешно сохранены');
		} catch (err: any) {
			setError(err.message || 'Ошибка сохранения');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-2xl mx-auto">
			<h2 className="text-2xl font-bold mb-6">Настройки профиля</h2>
			<form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-1">
						<label className="text-sm font-medium text-gray-700">Фамилия</label>
						<input required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" value={form.surname} onChange={e => setForm({ ...form, surname: e.target.value })} />
					</div>
					<div className="space-y-1">
						<label className="text-sm font-medium text-gray-700">Имя</label>
						<input required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
					</div>
					<div className="space-y-1">
						<label className="text-sm font-medium text-gray-700">Отчество</label>
						<input className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" value={form.patronym} onChange={e => setForm({ ...form, patronym: e.target.value })} />
					</div>
					<div className="space-y-1 col-span-2">
						<label className="text-sm font-medium text-gray-700">Email</label>
						<input type="email" required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
					</div>
					<div className="space-y-1 col-span-2">
						<label className="text-sm font-medium text-gray-700">Новый пароль (оставьте пустым, чтобы не менять)</label>
						<input type="password" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
					</div>
				</div>
				{success && <p className="text-green-600 text-sm text-center font-medium">{success}</p>}
				{error && <p className="text-red-500 text-sm text-center">{error}</p>}
				<button type="submit" disabled={loading} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition flex items-center justify-center gap-2">
					{loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Сохранить изменения
				</button>
			</form>
		</div>
	);
}