import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import EventCard from "../components/EventCard";
import { useEvents } from "../hook/useEvents";
import { useAuth } from "../hook/useAuth";

const CATEGORIES = ["All", "Symposium", "Competition", "Workshop", "Festival"];

function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { events } = useEvents();
  
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" ||
      event.type.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="py-10 space-y-10">
      <div className="relative w-full h-48 rounded-sm overflow-hidden border border-[#c9a227]/20 shadow-xl">
        <img
          src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2000"
          className="w-full h-full object-cover"
          alt="Banner"
        />
        <div className="absolute inset-0 bg-linear-to-r from-[#0a1628] to-transparent" />
        <div className="absolute inset-y-0 left-0 p-8 flex flex-col justify-center">
          <h2 className="text-2xl font-serif font-bold text-[#c9a227]">
            Faculty Event Portal
          </h2>
          <p className="text-slate-400 text-xs tracking-widest uppercase">
            University of Ruhuna
          </p>
        </div>
      </div>

      <div className="top-24 z-30 flex flex-col md:flex-row gap-4 p-4 bg-[#0a1628]/80 backdrop-blur-xl border border-[#c9a227]/10 rounded-sm">
        <div className="relative grow group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#c9a227] transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#060e1a] border border-[#c9a227]/20 rounded-sm py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 outline-none focus:border-[#c9a227] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <SlidersHorizontal
            size={16}
            className="text-[#c9a227] mr-2 shrink-0"
          />
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-[10px] font-bold tracking-widest uppercase rounded-sm border transition-all shrink-0
                ${
                  activeCategory === cat
                    ? "bg-[#c9a227] text-[#0a1525] border-[#c9a227]"
                    : "bg-transparent text-[#c9a227]/60 border-[#c9a227]/20 hover:border-[#c9a227]/60 hover:text-[#c9a227]"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-[10px] tracking-[0.2em] text-slate-500 uppercase">
            Showing {filteredEvents.length} Events
          </p>
        </div>

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border border-dashed border-[#c9a227]/20 rounded-sm">
            <p className="text-slate-500 font-serif italic text-sm">
              No events found matching your criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("All");
              }}
              className="mt-4 text-[#c9a227] text-[10px] tracking-widest font-bold hover:underline"
            >
              CLEAR ALL FILTERS
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
