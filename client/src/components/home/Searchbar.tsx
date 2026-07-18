import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

export default function Searchbar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const openSearch = () => navigate(`/search${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
  const submit = (event: FormEvent) => { event.preventDefault(); openSearch(); };
  return <div className="w-full"><div className="mx-auto w-93.75 bg-white pt-2"><form onSubmit={submit} className="relative mx-auto h-10 w-82 overflow-hidden rounded-xl border border-[#DDDCDB] bg-white" dir="rtl"><button type="button" onClick={openSearch} aria-label="رفتن به صفحه جستجو" className="absolute right-0 top-0 z-10 grid h-full w-12 cursor-pointer place-items-center border-0 bg-transparent"><img src="/images/searchbar/search.png" alt="" className="h-5 w-5" /></button><input type="search" value={query} onChange={event=>setQuery(event.target.value)} aria-label="جستجو" placeholder="جستجو در محصولات" className="h-full w-full bg-transparent pr-12 pl-4 text-right text-xs font-normal text-[#AAA] outline-none placeholder:text-[#C9C9C9] [&::-webkit-search-cancel-button]:hidden"/></form></div></div>;
}
