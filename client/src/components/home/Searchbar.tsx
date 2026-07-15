export default function Searchbar() {
  return (
    <div className="w-full">
      <div className="mx-auto w-93.75 bg-white pt-2">
        <div
          className="relative mx-auto h-10 w-82 overflow-hidden rounded-xl border border-[#DDDCDB] bg-white"
          dir="rtl"
        >
          <img
            src="/images/searchbar/search.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2"
          />

          <input
            type="search"
            aria-label="جستجو"
            placeholder="جستجو"
            className="h-full w-full bg-transparent pr-12 pl-4 text-right text-xs font-normal text-[#DDDCDB] outline-none placeholder:text-[#DDDCDB] [&::-webkit-search-cancel-button]:hidden"
          />
        </div>
      </div>
    </div>
  );
}