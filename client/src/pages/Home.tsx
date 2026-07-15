import Header from "../components/layout/Header";
import Searchbar from "../components/home/Searchbar";
import HeroSlider from "../components/home/HeroSlider";
import FestivalBanner from "../components/home/FestivalBanner";
import CategorySection from "../components/home/CategorySection";
import ProductSection from "../components/home/ProductSection";
import AdvertisementBanner from "../components/home/AdvertisementBanner";
import BottomNavigation from "../components/layout/BottomNavigation";

export default function Home() {
  return (
    <>
      <main id="home" className="pb-18 bg-[#1E1E1E]">
        <Header />
        <Searchbar />
        <HeroSlider />
        <FestivalBanner />
        <CategorySection />
        <ProductSection />
        <AdvertisementBanner />
      </main>
      <BottomNavigation />
    </>
  );
}