import { useEffect, useState } from "react";
import { API_URL } from "../../lib/api";

type Slide = {
  id: number;
  image: string;
  link: string;
};


export default function HeroSlider() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadSlides() {
      try {
        const response = await fetch(`${API_URL}/sliders`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("دریافت اسلایدرها با خطا مواجه شد");
        }

        const data: Slide[] = await response.json();
        setSlides(data);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error(error.message);
        }
      }
    }

    loadSlides();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (isPaused || slides.length < 2) return;

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isPaused, slides.length]);

  return (
    <div className="w-full">
      <section
        aria-label="پیشنهادهای ویژه"
        aria-roledescription="اسلایدر"
        className="mx-auto w-93.75 bg-white pb-5 pt-2"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
      >
        <div className="relative mx-auto h-37.25 w-82 overflow-hidden rounded-xl border-2 border-white bg-linear-to-r from-[#FF6174] to-[#C85EF1] shadow-[0_7px_18px_rgba(0,0,0,0.08)]">
          {slides.length > 0 && (
            <div
              className="flex h-full transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeSlide * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <a
                  href={slide.link}
                  className="block h-full w-full shrink-0"
                  key={slide.id}
                >
                  <img
                    src={slide.image}
                    alt={`پیشنهاد ویژه ${index + 1}`}
                    className="h-full w-full object-cover"
                    draggable="false"
                  />
                </a>
              ))}
            </div>
          )}

          {slides.length > 1 && (
            <div
              className="absolute bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1"
              role="group"
              aria-label="انتخاب اسلاید"
            >
              {slides.map((slide, index) => (
                <button
                  type="button"
                  key={slide.id}
                  onClick={() => setActiveSlide(index)}
                  aria-label={`نمایش اسلاید ${index + 1}`}
                  aria-current={activeSlide === index ? "true" : undefined}
                  className={`border border-gray-400 h-1.5 rounded-full transition-all duration-300 ${
                    activeSlide === index
                      ? "w-5 bg-white"
                      : "w-1.5 bg-white/35 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
