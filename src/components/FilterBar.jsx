import { Search, SlidersHorizontal, X } from 'lucide-react';
import PropTypes from 'prop-types';

const FilterBar = ({ searchTerm, setSearchTerm, dayFilter, setDayFilter }) => (
  <div className="flex w-full flex-col gap-3 sm:flex-row">
    <div className="relative min-w-0 flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        placeholder="Search students"
        aria-label="Search students"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={() => setSearchTerm('')}
          className="absolute right-2 top-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Clear search">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
    <div className="relative sm:w-52">
      <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <select
        value={dayFilter}
        onChange={(event) => setDayFilter(event.target.value)}
        aria-label="Filter students by day"
        className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10">
        <option value="all">All days</option>
        <option value="Monday">Monday</option>
        <option value="Tuesday">Tuesday</option>
        <option value="Wednesday">Wednesday</option>
        <option value="Thursday">Thursday</option>
        <option value="Friday">Friday</option>
      </select>
    </div>
  </div>
);

FilterBar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  dayFilter: PropTypes.string.isRequired,
  setDayFilter: PropTypes.func.isRequired,
};

export default FilterBar;
