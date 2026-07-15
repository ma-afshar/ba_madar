import { useEffect, useState } from "react";

const INITIAL_TIME = 12 * 60 * 60 + 45 * 60 + 59;

function toPersianNumber(value: number) {
  return value.toLocaleString("fa-IR", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
}

export default function FestivalBanner() {
  const [remainingTime, setRemainingTime] = useState(INITIAL_TIME);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemainingTime((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const hours = Math.floor(remainingTime / 3600);
  const minutes = Math.floor((remainingTime % 3600) / 60);
  const seconds = remainingTime % 60;
  const timeParts = [hours, minutes, seconds];

  return (
    <div className="w-full">
      <section className="mx-auto w-93.75 bg-white pb-4" aria-label="جشنواره فروش ویژه">
        <a
          href="#festival"
          className="mx-auto flex h-15 w-82 items-center justify-between rounded-xl border border-[#FFB9C0] bg-[#FFF7F8] px-3 no-underline"
        >
          <div
            className="flex items-center gap-1.25"
            dir="ltr"
            aria-label={`${hours} ساعت و ${minutes} دقیقه و ${seconds} ثانیه تا پایان جشنواره`}
          >
            {timeParts.map((part, index) => (
              <div className="contents" key={index}>
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className="flex h-6 w-0.5 flex-col items-center justify-center gap-0.75"
                  >
                    <i className="block h-0.5 w-0.5 rounded-full bg-[#FF3048]" />
                    <i className="block h-0.5 w-0.5 rounded-full bg-[#FF3048]" />
                  </span>
                )}
                <span className="flex h-6 w-7.5 items-center justify-center rounded-[3px] bg-[#FF3048] pt-px text-xs font-medium leading-none text-white tabular-nums">
                  {toPersianNumber(part)}
                </span>
              </div>
            ))}
          </div>

          <img
            src="/images/festival/festival.png"
            alt="جشنواره فروش ویژه"
            className="h-9 w-31.5 object-contain"
          />
        </a>
      </section>
    </div>
  );
}