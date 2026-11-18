import {
  ArrowUpDown,
  Pencil,
  Search,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { YEAR_LEVEL_OPTIONS, type Student } from '../types/student';

export type SortField = 'created_at' | 'student_id' | 'full_name' | 'program' | 'year_level';
export type SortDirection = 'asc' | 'desc';

interface StudentTableProps {
  students: Student[];
  totalCount: number;
  isLoading: boolean;
  isConfigured: boolean;
  searchQuery: string;
  programFilter: string;
  yearFilter: string;
  availablePrograms: string[];
  editingId: Student['id'] | null;
  sortField: SortField;
  sortDirection: SortDirection;
  onSearchChange: (value: string) => void;
  onProgramFilterChange: (value: string) => void;
  onYearFilterChange: (value: string) => void;
  onClearFilters: () => void;
  onSort: (field: SortField) => void;
  onEdit: (student: Student) => void;
  onDeleteRequest: (student: Student) => void;
  onFocusForm: () => void;
}

export function StudentTable({
  students,
  totalCount,
  isLoading,
  isConfigured,
  searchQuery,
  programFilter,
  yearFilter,
  availablePrograms,
  editingId,
  sortField,
  sortDirection,
  onSearchChange,
  onProgramFilterChange,
  onYearFilterChange,
  onClearFilters,
  onSort,
  onEdit,
  onDeleteRequest,
  onFocusForm,
}: StudentTableProps) {
  const hasActiveFilters =
    searchQuery.trim() !== '' || programFilter !== 'ALL' || yearFilter !== 'ALL';

  const renderSortHeader = (label: string, field: SortField) => {
    const isActive = sortField === field;
    return (
      <button
        type="button"
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-1.5 text-left text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
      >
        <span>{label}</span>
        <ArrowUpDown
          className={`w-3.5 h-3.5 ${
            isActive ? 'text-blue-800' : 'text-slate-400'
          }`}
        />
        {isActive && (
          <span className="sr-only">
            {sortDirection === 'asc' ? 'sorted ascending' : 'sorted descending'}
          </span>
        )}
      </button>
    );
  };

  return (
    <section
      aria-labelledby="student-directory-heading"
      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
    >
      {/* Directory Header & Search Controls */}
      <div className="px-6 py-5 border-b border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2
              id="student-directory-heading"
              className="text-base font-semibold text-slate-900"
            >
              Student Directory
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
              Showing {students.length} of {totalCount}{' '}
              {totalCount === 1 ? 'record' : 'records'}
            </p>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 relative">
            <Search
              className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by name, student ID, or program..."
              aria-label="Search students by name, ID, or program"
              className="w-full pl-10 pr-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={programFilter}
              onChange={(e) => onProgramFilterChange(e.target.value)}
              aria-label="Filter by academic program"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
            >
              <option value="ALL">All Programs</option>
              {availablePrograms.map((prog) => (
                <option key={prog} value={prog}>
                  {prog}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={yearFilter}
              onChange={(e) => onYearFilterChange(e.target.value)}
              aria-label="Filter by year level"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
            >
              <option value="ALL">All Year Levels</option>
              {YEAR_LEVEL_OPTIONS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading Skeleton State */}
      {isLoading ? (
        <div className="divide-y divide-slate-100" aria-busy="true" aria-label="Loading student records">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="px-6 py-4 flex items-center justify-between gap-4 animate-pulse">
              <div className="flex items-center gap-6 flex-1 min-w-0">
                <div className="h-4 w-24 bg-slate-200 rounded" />
                <div className="h-4 w-40 bg-slate-200 rounded" />
                <div className="h-4 w-16 bg-slate-100 rounded hidden sm:block" />
                <div className="h-4 w-20 bg-slate-100 rounded hidden md:block" />
                <div className="h-4 w-44 bg-slate-100 rounded hidden lg:block" />
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="h-8 w-16 bg-slate-100 rounded-md" />
                <div className="h-8 w-16 bg-slate-100 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : students.length === 0 ? (
        /* Empty State */
        <div className="px-6 py-16 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6" />
          </div>
          {!isConfigured ? (
            <>
              <h3 className="text-sm font-semibold text-slate-900">
                Connect Supabase to load student records
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1.5">
                Configure your Supabase Project URL and Anon Public Key to enable live reading,
                creating, editing, and deleting of student records.
              </p>
            </>
          ) : hasActiveFilters ? (
            <>
              <h3 className="text-sm font-semibold text-slate-900">
                No matching student records
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1.5">
                No records match your current search or filter criteria. Try adjusting your
                filters to see more students.
              </p>
              <button
                type="button"
                onClick={onClearFilters}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Reset Search &amp; Filters</span>
              </button>
            </>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-slate-900">
                No student records found
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto mt-1.5">
                Your Supabase <code className="font-mono text-slate-700">students</code> table is
                currently empty. Add your first student using the enrollment form.
              </p>
              <button
                type="button"
                onClick={onFocusForm}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add First Student</span>
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Desktop & Tablet Responsive Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="py-3 pl-6 pr-3">{renderSortHeader('Student ID', 'student_id')}</th>
                  <th className="py-3 px-3">{renderSortHeader('Full Name', 'full_name')}</th>
                  <th className="py-3 px-3">{renderSortHeader('Program', 'program')}</th>
                  <th className="py-3 px-3">{renderSortHeader('Year Level', 'year_level')}</th>
                  <th className="py-3 px-3 text-xs font-semibold text-slate-600">Email</th>
                  <th className="py-3 pl-3 pr-6 text-right text-xs font-semibold text-slate-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {students.map((student) => {
                  const isBeingEdited = editingId === student.id;
                  return (
                    <tr
                      key={student.id}
                      className={`transition-colors ${
                        isBeingEdited
                          ? 'bg-blue-50/60'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3.5 pl-6 pr-3 font-mono tabular-nums font-medium text-slate-900 whitespace-nowrap">
                        {student.student_id}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{student.full_name}</span>
                          {isBeingEdited && (
                            <span className="text-xs font-medium text-blue-800">
                              · Editing
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 font-medium whitespace-nowrap">
                        {student.program}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">
                        {student.year_level}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 max-w-[220px] truncate">
                        <a
                          href={`mailto:${student.email}`}
                          className="hover:text-blue-800 hover:underline transition-colors"
                          title={student.email}
                        >
                          {student.email}
                        </a>
                      </td>
                      <td className="py-3.5 pl-3 pr-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEdit(student)}
                            aria-label={`Edit ${student.full_name}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[34px] text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-blue-300 hover:text-blue-800 hover:bg-blue-50/50 rounded-md transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteRequest(student)}
                            aria-label={`Delete ${student.full_name}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 min-h-[34px] text-xs font-medium text-red-700 bg-white border border-slate-200 hover:border-red-300 hover:bg-red-50 rounded-md transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List (< md) */}
          <div className="md:hidden divide-y divide-slate-200">
            {students.map((student) => {
              const isBeingEdited = editingId === student.id;
              return (
                <div
                  key={student.id}
                  className={`p-4 space-y-3 ${isBeingEdited ? 'bg-blue-50/60' : 'bg-white'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {student.full_name}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-600">
                        <span className="font-mono tabular-nums font-medium text-slate-800">
                          {student.student_id}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-medium text-slate-700">{student.program}</span>
                        <span aria-hidden="true">·</span>
                        <span>{student.year_level}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 truncate">{student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onEdit(student)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[40px] text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteRequest(student)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 min-h-[40px] text-xs font-medium text-red-700 bg-white border border-slate-300 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
