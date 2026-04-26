const STATUS_OPTIONS = [
  { value: 'all',       label: 'All' },
  { value: 'completed', label: 'Completed today' },
  { value: 'pending',   label: 'Pending today' },
];

const SORT_OPTIONS = [
  { value: 'default',       label: 'Default' },
  { value: 'name',          label: 'Name' },
  { value: 'streak',        label: 'Streak' },
  { value: 'lastCompleted', label: 'Last completed' },
];

export default function HabitFilterBar({ filters, onChange }) {
  return (
    <div className="flex items-center gap-3 flex-wrap mb-5">
      {/* Status pills */}
      <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg p-1">
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange({ ...filters, status: opt.value })}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-150
              ${filters.status === opt.value
                ? 'bg-white shadow-sm text-gray-800'
                : 'text-gray-500 hover:text-gray-700'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="h-5 w-px bg-gray-200" />

      {/* Sort dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 font-medium">Sort by</span>
        <select
          value={filters.sortBy}
          onChange={e => onChange({ ...filters, sortBy: e.target.value })}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-700
            bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 cursor-pointer"
        >
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Active filter indicator */}
      {(filters.status !== 'all' || filters.sortBy !== 'default') && (
        <button
          onClick={() => onChange({ status: 'all', sortBy: 'default' })}
          className="text-xs text-purple-600 hover:text-purple-800 underline underline-offset-2"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
