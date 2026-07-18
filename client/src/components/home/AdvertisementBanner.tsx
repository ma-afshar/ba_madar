import { useEffect, useState } from "react";
import { API_URL } from "../../lib/api";

type Banner = {
  id: number;
  image: string;
  link: string;
};

export default function AdvertisementBanner() {
  const [banner, setBanner] = useState<Banner | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBanner() {
      try {
        const response = await fetch(`${API_URL}/banners`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("دریافت بنر تبلیغاتی با خطا مواجه شد");
        }

        const data: Banner[] = await response.json();
        setBanner(data[0] ?? null);
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error(error.message);
        }
      }
    }

    loadBanner();

    return () => controller.abort();
  }, []);

  if (!banner) return null;

  return (
    <div className="w-full">
      <section
        className="mx-auto w-93.75 bg-white pb-5"
        aria-label="تبلیغات"
      >
        <a
          href={banner.link}
          className="mx-auto block h-17.25 w-82 overflow-hidden rounded-xl"
        >
          <img
            src={banner.image}
            alt="بنر تبلیغاتی ساعت هوشمند"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </a>
      </section>
    </div>
  );
}
