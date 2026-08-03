import { Search, Filter } from 'lucide-react';
import PropTypes from 'prop-types';

const FilterBar = ({ searchTerm, setSearchTerm, dayFilter, setDayFilter }) => {
  return (
    <div className="w-full flex flex-col gap-4 md:flex-row">
      {/* Search Input */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-3 bg-gray-100 rounded-lg border border-transparent focus:border-b-emerald-600 focus:bg-white focus:outline-none transition-all w-full focus:shadow-md"
        />
      </div>

      {/* Day Filter Dropdown */}
      <div className="relative md:w-1/3">
        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <select
          value={dayFilter}
          onChange={(e) => setDayFilter(e.target.value)}
          className="pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-all appearance-none cursor-pointer w-full">
          <option value="all">All Days</option>
          <option value="Monday">Monday</option>
          <option value="Tuesday">Tuesday</option>
          <option value="Wednesday">Wednesday</option>
          <option value="Thursday">Thursday</option>
          <option value="Friday">Friday</option>
          <option value="Saturday">Saturday</option>
          <option value="Sunday">Sunday</option>
        </select>
      </div>
    </div>
  );
};

// Prop Validation
FilterBar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
  dayFilter: PropTypes.string.isRequired,
  setDayFilter: PropTypes.func.isRequired,
};
export default FilterBar;
