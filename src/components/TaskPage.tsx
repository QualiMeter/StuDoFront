import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTasks, getSubtasks, createSubtask, updateSubtask, deleteSubtask, getAiKey, getAiModel, logAiRequest } from '../api/client';
import type { Task, Subtask } from '../types';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { ArrowLeft, Trash2, Loader2, Bot, Send, Check, X, Sparkles, MessageSquare, Edit3, Save } from 'lucide-react';

type SubtaskWithStatus = Subtask & { status: 'todo' | 'in_progress' | 'done' };

export function TaskPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [task, setTask] = useState<Task | null>(null);
	const [subtasks, setSubtasks] = useState<SubtaskWithStatus[]>([]);
	const [loading, setLoading] = useState(true);

	const [isEditOpen, setIsEditOpen] = useState(false);
	const [editingSub, setEditingSub] = useState<SubtaskWithStatus | null>(null);
	const [editForm, setEditForm] = useState({ title: '' });
	const [editLoading, setEditLoading] = useState(false);

	const [isAiOpen, setIsAiOpen] = useState(false);
	const [aiMessages, setAiMessages] = useState<{ id: string; role: string; content: string; proposal?: any }[]>([]);
	const [aiInput, setAiInput] = useState('');
	const [aiLoading, setAiLoading] = useState(false);
	const [pendingProposal, setPendingProposal] = useState<any>(null);
	const [apiKey, setApiKey] = useState('');
	const [modelName, setModelName] = useState('meta-llama/llama-3.3-70b-instruct');
	const aiEndRef = useRef<HTMLDivElement>(null);

	const AI_TOOLS = [
		{
			type: 'function' as const,
			function: {
				name: 'proposeSubtasks',
				description: 'Генерирует новые подзадачи для текущей задачи на основе запроса пользователя. Не создаёт их напрямую, только предлагает.',
				parameters: {
					type: 'object',
					properties: {
						subtasks: {
							type: 'array',
							items: { type: 'object', properties: { title: { type: 'string' } }, required: ['title'] }
						}
					},
					required: ['subtasks']
				}
			}
		}
	];

	const loadTaskData = useCallback(async () => {
		if (!id) return;
		try {
			const [tasksRes, subsRes] = await Promise.allSettled([getTasks(), getSubtasks()]);
			const tasks = tasksRes.status === 'fulfilled' ? (Array.isArray(tasksRes.value) ? tasksRes.value : []) : [];
			const subs = subsRes.status === 'fulfilled' ? (Array.isArray(subsRes.value) ? subsRes.value : []) : [];

			const currentTask = tasks.find(t => t.id === id);
			setTask(currentTask || null);

			const taskSubs = subs
				.filter(s => s.taskId === id)
				.map(s => ({
					...s,
					status: s.isCompleted ? 'done' : 'todo',
					isCompleted: !!s.isCompleted
				} as SubtaskWithStatus));

			setSubtasks(taskSubs);
		} catch (err) {
			console.error('Failed to load task ', err);
		} finally {
			setLoading(false);
		}
	}, [id]);

	useEffect(() => { loadTaskData(); }, [loadTaskData]);

	useEffect(() => {
		if (isAiOpen && aiMessages.length === 0) {
			Promise.allSettled([getAiKey(), getAiModel()]).then(([k, m]) => {
				if (k.status === 'fulfilled' && k.value) setApiKey(k.value);
				if (m.status === 'fulfilled' && m.value) setModelName(m.value);
			});
			setAiMessages([{ id: crypto.randomUUID(), role: 'assistant', content: `Привет! Я помогу разбить задачу "${task?.title || ''}" на шаги. Опиши, что нужно добавить, и я предложу подзадачи.` }]);
		}
	}, [isAiOpen, task?.title]);

	useEffect(() => { aiEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [aiMessages, pendingProposal]);

	const handleDragEnd = (result: DropResult) => {
		const { source, destination, draggableId } = result;
		if (!destination) return;
		if (source.droppableId === destination.droppableId && source.index === destination.index) return;

		const newStatus = destination.droppableId as SubtaskWithStatus['status'];
		const isCompleted = newStatus === 'done';

		setSubtasks(prev => prev.map(s =>
			s.id === draggableId ? { ...s, status: newStatus, isCompleted } : s
		));
	};

	const openEditDrawer = (sub: SubtaskWithStatus) => {
		setEditingSub(sub);
		setEditForm({ title: sub.title || '' });
		setIsEditOpen(true);
	};

	const closeEditDrawer = () => {
		setIsEditOpen(false);
		setEditingSub(null);
		setEditForm({ title: '' });
	};

	const handleSaveEdit = async () => {
		if (!editingSub) return;
		setEditLoading(true);
		try {
			await updateSubtask(editingSub.id, { title: editForm.title, isCompleted: editingSub.isCompleted });
			setSubtasks(prev => prev.map(s => s.id === editingSub.id ? { ...s, title: editForm.title } : s));
			closeEditDrawer();
		} catch (err) {
			console.error('Не удалось обновить подзадачу:', err);
		} finally {
			setEditLoading(false);
		}
	};

	const removeSubtask = async (subId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		try {
			await deleteSubtask(subId);
			setSubtasks(prev => prev.filter(s => s.id !== subId));
		} catch (err) { console.error(err); }
	};

	const handleAiSend = async () => {
		if (!aiInput.trim() || aiLoading || pendingProposal || !apiKey) return;
		const userMsg = { id: crypto.randomUUID(), role: 'user', content: aiInput };
		setAiMessages(prev => [...prev, userMsg]);
		setAiInput(''); setAiLoading(true);
		const history = [...aiMessages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: userMsg.content }];

		try {
			const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'HTTP-Referer': window.location.origin, 'X-Title': 'StuDo' },
				body: JSON.stringify({
					model: modelName,
					messages: [
						{ role: 'system', content: 'Ты ассистент по декомпозиции задач. Отвечай кратко. Используй инструмент proposeSubtasks ТОЛЬКО когда пользователь просит добавить или сгенерировать подзадачи. Не создавай их напрямую.' },
						...history
					],
					tools: AI_TOOLS,
					tool_choice: 'auto'
				})
			});
			const data = await res.json();
			if (data.usage) logAiRequest({ model: modelName, promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens, totalTokens: data.usage.total_tokens, status: 'success' });

			const msg = data.choices?.[0]?.message;
			if (msg?.tool_calls?.[0]) {
				const args = JSON.parse(msg.tool_calls[0].function.arguments);
				setPendingProposal(args);
				setAiMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: '', proposal: args }]);
			} else {
				setAiMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: msg?.content || 'Готово.' }]);
			}
		} catch (err: any) {
			logAiRequest({ model: modelName, status: 'fail', errorMessage: err.message });
			setAiMessages(prev => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: 'Ошибка соединения.' }]);
		} finally { setAiLoading(false); }
	};

	const executeProposal = async (confirm: boolean) => {
		if (!pendingProposal) return;
		setAiLoading(true);
		let resultMsg = confirm ? '✅ Подзадачи добавлены.' : '❌ Отменено.';

		if (confirm) {
			try {
				const newSubs = await Promise.all(
					pendingProposal.subtasks.map((s: any) =>
						createSubtask({
							id: crypto.randomUUID(),
							taskId: id!,
							title: s.title,
							isCompleted: false,
							sortOrder: subtasks.length,
							createdAt: new Date().toISOString(),
							updatedAt: new Date().toISOString()
						})
					)
				);

				const addedSubtasks: SubtaskWithStatus[] = newSubs.map(s => ({
					...s,
					status: 'todo' as const,
					isCompleted: false
				}));

				setSubtasks(prev => [...prev, ...addedSubtasks]);
			} catch { resultMsg = '⚠️ Ошибка при создании.'; }
		}

		setPendingProposal(null); setAiLoading(false);
		setAiMessages(prev => [...prev.filter(m => !m.proposal), { id: crypto.randomUUID(), role: 'assistant', content: resultMsg }]);
	};

	const columns: { key: SubtaskWithStatus['status']; label: string; color: string; bg: string }[] = [
		{ key: 'todo', label: '📋 К выполнению', color: 'text-gray-700', bg: 'bg-gray-100' },
		{ key: 'in_progress', label: '🔄 В работе', color: 'text-amber-700', bg: 'bg-amber-100' },
		{ key: 'done', label: '✅ Готово', color: 'text-green-700', bg: 'bg-green-100' }
	];

	if (loading) return <div className="pt-10 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>;
	if (!task) return <div className="pt-10 text-center text-gray-500">Задача не найдена</div>;

	return (
		<div className="max-w-6xl mx-auto space-y-6 pb-24">
			<div className="flex items-center gap-3">
				<button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition"><ArrowLeft size={20} /></button>
				<h2 className="text-2xl font-bold text-gray-800 truncate">{task.title}</h2>
			</div>

			{/* 🔹 Jira-колонки с Drag & Drop */}
			<DragDropContext onDragEnd={handleDragEnd}>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{columns.map(col => (
						<Droppable key={col.key} droppableId={col.key}>
							{(provided, snapshot) => (
								<div
									ref={provided.innerRef}
									{...provided.droppableProps}
									className={`bg-gray-50/80 rounded-2xl p-3 flex flex-col gap-3 min-h-[300px] transition-colors ${snapshot.isDraggingOver ? 'bg-indigo-50/50 ring-2 ring-indigo-200' : ''}`}
								>
									<div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${col.bg} ${col.color} w-fit`}>{col.label}</div>
									<div className="space-y-2 flex-1">
										{subtasks.filter(s => s.status === col.key).map((sub, index) => (
											<Draggable key={sub.id} draggableId={sub.id} index={index}>
												{(provided, snapshot) => (
													<div
														ref={provided.innerRef}
														{...provided.draggableProps}
														{...provided.dragHandleProps}
														onClick={() => !snapshot.isDragging && openEditDrawer(sub)}
														className={`bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition group cursor-grab active:cursor-grabbing ${snapshot.isDragging ? 'shadow-lg ring-2 ring-indigo-300 rotate-1 z-50' : ''}`}
													>
														<div className="flex justify-between items-start gap-2">
															<p className="text-sm font-medium text-gray-800 flex-1">{sub.title}</p>
															<button onClick={(e) => removeSubtask(sub.id, e)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition text-gray-400 hover:text-red-500 cursor-pointer"><Trash2 size={14} /></button>
														</div>
													</div>
												)}
											</Draggable>
										))}
										{provided.placeholder}
										{subtasks.filter(s => s.status === col.key).length === 0 && (
											<div className="text-center py-6 text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">Пусто</div>
										)}
									</div>
								</div>
							)}
						</Droppable>
					))}
				</div>
			</DragDropContext>

			{/* 🔹 Панель редактирования подзадачи (справа) */}
			<div className={`fixed inset-0 z-50 transition-opacity duration-200 ${isEditOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
				<div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={closeEditDrawer} />
				<div className={`absolute top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isEditOpen ? 'translate-x-0' : 'translate-x-full'}`}>
					<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
						<div className="flex items-center gap-3">
							<button onClick={closeEditDrawer} className="p-1.5 hover:bg-gray-100 rounded-lg transition text-gray-500"><X size={20} /></button>
							<h3 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Edit3 size={18} /> Редактирование</h3>
						</div>
					</div>
					<div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-4">
						<div className="space-y-1">
							<label className="text-xs font-medium text-gray-600">Название подзадачи</label>
							<input
								type="text"
								value={editForm.title}
								onChange={e => setEditForm({ ...editForm, title: e.target.value })}
								className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
								placeholder="Введите название..."
							/>
						</div>
						<div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800">
							💡 Перетаскивайте карточки между колонками для смены статуса. Изменения сохраняются локально.
						</div>
					</div>
					<div className="p-4 border-t border-gray-200 bg-white shrink-0 flex gap-3">
						<button onClick={closeEditDrawer} disabled={editLoading} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition disabled:opacity-50">Отмена</button>
						<button onClick={handleSaveEdit} disabled={editLoading || !editForm.title.trim()} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition disabled:opacity-50 flex items-center justify-center gap-2">
							{editLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Сохранить
						</button>
					</div>
				</div>
			</div>

			{/* 🔹 AI Панель */}
			<div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3">
				{isAiOpen && (
					<div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[60vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
						<div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
							<div className="flex items-center gap-2"><Bot size={16} className="text-indigo-600" /><span className="text-sm font-semibold text-gray-700">AI Декомпозитор</span></div>
							<button onClick={() => setIsAiOpen(false)} className="p-1 hover:bg-gray-200 rounded transition"><X size={16} /></button>
						</div>
						<div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50/30">
							{aiMessages.map(msg => (
								<div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
									<div className={`max-w-[85%] p-2.5 rounded-xl text-xs ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-700 rounded-bl-none'}`}>
										{msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
										{msg.proposal && (
											<div className="mt-2 bg-indigo-50 border border-indigo-100 rounded-lg p-2">
												<p className="text-[10px] font-semibold text-indigo-900 mb-1">📦 Предложение:</p>
												<ul className="list-disc pl-3 text-[10px] text-indigo-800">{msg.proposal.subtasks.map((s: any, i: number) => <li key={i}>{s.title}</li>)}</ul>
											</div>
										)}
									</div>
								</div>
							))}
							{pendingProposal && (
								<div className="flex gap-2 mt-1">
									<button onClick={() => executeProposal(true)} disabled={aiLoading} className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-medium transition disabled:opacity-50 flex items-center justify-center gap-1"><Check size={10} /> Добавить</button>
									<button onClick={() => executeProposal(false)} disabled={aiLoading} className="flex-1 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-[10px] font-medium hover:bg-gray-50 transition disabled:opacity-50 flex items-center justify-center gap-1"><X size={10} /> Отмена</button>
								</div>
							)}
							<div ref={aiEndRef} />
						</div>
						<div className="p-3 border-t border-gray-200 bg-white">
							<div className="flex items-center gap-2">
								<input type="text" placeholder="Например: добавь шаги для тестирования..." className="flex-1 p-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500/40" value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAiSend()} disabled={aiLoading || !!pendingProposal || !apiKey} />
								<button onClick={handleAiSend} disabled={aiLoading || !!pendingProposal || !aiInput.trim() || !apiKey} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition">{aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}</button>
							</div>
						</div>
					</div>
				)}
				<button onClick={() => setIsAiOpen(!isAiOpen)} className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full shadow-lg shadow-indigo-300/50 transition flex items-center gap-2">
					{isAiOpen ? <MessageSquare size={20} /> : <Sparkles size={20} />}
				</button>
			</div>
		</div>
	);
}