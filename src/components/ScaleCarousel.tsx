import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const FEATURES = [
	{ title: 'AI-планирование', desc: 'Нейросеть автоматически разбивает большие цели на подзадачи, расставляет приоритеты и предлагает оптимальные сроки.', icon: '✨' },
	{ title: 'Контроль дедлайнов', desc: 'Цветовая индикация сроков, автоматические напоминания и интеграция с Telegram-ботом для мгновенных уведомлений.', icon: '⏰' },
	{ title: 'Панель ментора', desc: 'Отслеживайте прогресс студентов, проверяйте выполненные задачи, управляйте курсами и давайте персональный фидбек.', icon: '🎓' },
	{ title: 'Аналитика прогресса', desc: 'Наглядные графики выполнения задач, статистика использования ИИ и отчёты по успеваемости в реальном времени.', icon: '📊' },
];

export function ScaleCarousel() {
	const [emblaRef, emblaApi] = useEmblaCarousel({
		loop: true,
		align: 'center',
		skipSnaps: false,
		dragFree: true,
		containScroll: 'trimSnaps'
	});
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

	const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
	const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
	const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

	const onSelect = useCallback(() => {
		if (!emblaApi) return;
		setSelectedIndex(emblaApi.selectedScrollSnap());
	}, [emblaApi]);

	useEffect(() => {
		if (!emblaApi) return;
		onSelect();
		setScrollSnaps(emblaApi.scrollSnapList());
		emblaApi.on('select', onSelect);
		emblaApi.on('reInit', onSelect);
		return () => {
			emblaApi.off('select', onSelect);
			emblaApi.off('reInit', onSelect);
		};
	}, [emblaApi, onSelect]);

	return (
		<div className="w-full max-w-7xl mx-auto px-8 py-12 relative">
			<div className="overflow-visible" ref={emblaRef}>
				<div className="flex -ml-4">
					{FEATURES.map((item, i) => (
						<div
							key={i}
							className="flex-[0_0_100%] sm:flex-[0_0_85%] lg:flex-[0_0_60%] min-w-0 pl-4"
						>
							<div
								className="bg-white/90 backdrop-blur-xl border border-gray-200 shadow-2xl p-8 md:p-10 h-full flex flex-col items-center text-center rounded-3xl transition-all duration-500 ease-out"
								style={{
									transform: i === selectedIndex ? 'scale(1.08) translateY(-8px)' : 'scale(0.92) translateY(0)',
									opacity: i === selectedIndex ? 1 : 0.6,
									boxShadow: i === selectedIndex ? '0 25px 50px -12px rgba(99, 102, 241, 0.25)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
								}}
							>
								<div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-inner">
									{item.icon}
								</div>
								<h3 className="text-2xl font-bold text-gray-800 mb-3">{item.title}</h3>
								<p className="text-gray-500 text-base leading-relaxed">{item.desc}</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Навигация */}
			<button
				onClick={scrollPrev}
				className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition text-gray-600 hover:scale-110 z-10"
			>
				<ChevronLeft size={24} />
			</button>
			<button
				onClick={scrollNext}
				className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition text-gray-600 hover:scale-110 z-10"
			>
				<ChevronRight size={24} />
			</button>

			{/* Индикаторы */}
			<div className="flex justify-center gap-3 mt-8">
				{scrollSnaps.map((_, i) => (
					<button
						key={i}
						onClick={() => scrollTo(i)}
						className={`h-2.5 rounded-full transition-all duration-300 ${i === selectedIndex ? 'bg-indigo-600 w-8' : 'bg-gray-300 w-2.5 hover:bg-gray-400'}`}
					/>
				))}
			</div>
		</div>
	);
}