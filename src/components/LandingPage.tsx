import { useNavigate } from 'react-router-dom';
import { ScaleCarousel } from './ScaleCarousel';
import { LiveStats } from './LiveStats';
import { ArrowRight, Sparkles } from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-white overflow-hidden">

      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium mb-6">
            <Sparkles size={12} /> ИИ-планировщик нового поколения
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight mb-6">
            Управляй учёбой <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500">
              без стресса и дедлайнов
            </span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            StuDo автоматически разбивает сложные задачи на шаги, отслеживает прогресс и синхронизирует уведомления с Telegram. Создан для студентов, оптимизирован для менторов.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/student/tasks')} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition shadow-lg shadow-indigo-200/50 flex items-center gap-2">
              Начать использовать <ArrowRight size={18} />
            </button>
            <button className="px-6 py-3 bg-white hover:bg-gray-50 text-slate-700 border border-gray-200 rounded-xl font-medium transition shadow-sm">
              Смотреть демо
            </button>
          </div>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl -z-10 pointer-events-none" />
      </section>

      <LiveStats />

      <section className="py-12 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-800 mb-2">Возможности платформы</h2>
          <p className="text-center text-gray-500 mb-8 max-w-lg mx-auto">Всё необходимое для эффективного обучения и управления учебным процессом</p>
          <ScaleCarousel />
        </div>
      </section>

      <section className="py-14 px-4 bg-gradient-to-b from-transparent to-indigo-50/50">
        <div className="max-w-5xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-800 mb-3">Как это работает</h2>
          <p className="text-gray-500">Три простых шага к продуктивности</p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
          {[
            { step: "01", title: "Создай задачу", desc: "Введи название или опиши проект текстом. ИИ поймёт контекст и приоритеты." },
            { step: "02", title: "ИИ разобьёт на шаги", desc: "Автоматическая декомпозиция, расстановка дедлайнов и подзадач." },
            { step: "03", title: "Отслеживай прогресс", desc: "Визуальные отчёты, напоминания в Telegram и аналитика для ментора." }
          ].map((item, i) => (
            <div key={i} className="relative bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition group flex flex-col items-center justify-center text-center min-h-[180px]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-md z-10">{item.step}</div>
              <h3 className="mt-1.5 text-lg font-semibold text-slate-800 mb-1.5">{item.title}</h3>
              <p className="text-gray-500 text-sm leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 px-4 text-center">
        <div className="max-w-lg mx-auto bg-gradient-to-br from-indigo-600 to-blue-600 p-5 rounded-2xl text-white shadow-xl shadow-indigo-200/50">
          <h2 className="text-xl font-bold mb-2">Готов взять учёбу под контроль?</h2>
          <p className="text-indigo-100 mb-4 text-sm opacity-90">Присоединяйся к StuDo сегодня. Регистрация бесплатна.</p>
          <button onClick={() => navigate('/student/tasks')} className="w-full sm:w-auto px-6 py-2 bg-white text-indigo-600 hover:bg-gray-100 rounded-lg font-semibold transition shadow-md inline-flex items-center justify-center gap-2 text-sm">
            Создать аккаунт <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}