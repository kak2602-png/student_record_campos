import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Database,
  GraduationCap,
  Menu,
  Plus,
  RefreshCw,
  Users,
  X,
} from 'lucide-react';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { SetupGuidePanel } from './components/SetupGuidePanel';
import { StudentForm } from './components/StudentForm';
import {
  StudentTable,
  type SortDirection,
  type SortField,
} from './components/StudentTable';
import { isSupabaseConfigured, parseSupabaseError, supabase } from './lib/supabase';
import {
  COMMON_PROGRAMS,
  YEAR_LEVEL_OPTIONS,
  type FormErrors,
  type StatusBanner,
  type Student,
  type StudentFormData,
} from './types/student';

const EMPTY_FORM: StudentFormData = {
  student_id: '',
  full_name: '',
  program: '',
  year_level: '',
  email: '',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function App() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(isSupabaseConfigured);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [dbLoadError, setDbLoadError] = useState<string | null>(null);

  const [activeView, setActiveView] = useState<'directory' | 'setup'>('directory');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Form state
  const [formData, setFormData] = useState<StudentFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formFocusTrigger, setFormFocusTrigger] = useState<number>(0);

  // Search, filter & sort state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [programFilter, setProgramFilter] = useState<string>('ALL');
  const [yearFilter, setYearFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Delete confirmation modal state
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Notification banner
  const [banner, setBanner] = useState<StatusBanner | null>(null);

  const showBanner = useCallback(
    (type: StatusBanner['type'], title: string, message: string) => {
      setBanner({ id: Date.now(), type, title, message });
    },
    []
  );

  useEffect(() => {
    if (!banner) return;
    const timer = window.setTimeout(() => {
      setBanner((current) => (current?.id === banner.id ? null : current));
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [banner]);

  const fetchStudents = useCallback(async (isManualRefresh = false) => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setDbLoadError(null);

    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        const parsed = parseSupabaseError(error);
        setDbLoadError(parsed.message);
        return;
      }

      setStudents((data as Student[]) ?? []);
    } catch (err) {
      const parsed = parseSupabaseError(err);
      setDbLoadError(parsed.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents(false);
  }, [fetchStudents]);

  // Derived data for filters and summary counts
  const availablePrograms = useMemo(() => {
    const programSet = new Set<string>(COMMON_PROGRAMS);
    for (const student of students) {
      if (student.program.trim()) {
        programSet.add(student.program.trim());
      }
    }
    return Array.from(programSet).sort((a, b) => a.localeCompare(b));
  }, [students]);

  const uniqueProgramsInRecords = useMemo(() => {
    const set = new Set<string>();
    for (const student of students) {
      if (student.program.trim()) {
        set.add(student.program.trim().toUpperCase());
      }
    }
    return set.size;
  }, [students]);

  const yearLevelCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const level of YEAR_LEVEL_OPTIONS) {
      counts[level] = 0;
    }
    for (const student of students) {
      if (counts[student.year_level] !== undefined) {
        counts[student.year_level] += 1;
      }
    }
    return counts;
  }, [students]);

  const filteredAndSortedStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = students.filter((student) => {
      if (programFilter !== 'ALL' && student.program !== programFilter) {
        return false;
      }
      if (yearFilter !== 'ALL' && student.year_level !== yearFilter) {
        return false;
      }
      if (!q) return true;

      return (
        student.full_name.toLowerCase().includes(q) ||
        student.student_id.toLowerCase().includes(q) ||
        student.program.toLowerCase().includes(q) ||
        student.email.toLowerCase().includes(q)
      );
    });

    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'created_at') {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        comparison = aTime - bTime;
      } else {
        comparison = (a[sortField] || '').localeCompare(b[sortField] || '', undefined, {
          numeric: true,
          sensitivity: 'base',
        });
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [students, searchQuery, programFilter, yearFilter, sortField, sortDirection]);

  // Form validation
  const validateForm = (data: StudentFormData): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!data.student_id.trim()) {
      nextErrors.student_id = 'Student ID is required.';
    }
    if (!data.full_name.trim()) {
      nextErrors.full_name = 'Full Name is required.';
    }
    if (!data.program.trim()) {
      nextErrors.program = 'Academic Program is required.';
    }
    if (!data.year_level.trim()) {
      nextErrors.year_level = 'Please select a Year Level.';
    }
    if (!data.email.trim()) {
      nextErrors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(data.email.trim())) {
      nextErrors.email = 'Please enter a valid email address (e.g. name@university.edu).';
    }

    return nextErrors;
  };

  const handleFieldChange = (field: keyof StudentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleResetForm = () => {
    setFormData(EMPTY_FORM);
    setFormErrors({});
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
  };

  const handleStartEdit = (student: Student) => {
    setActiveView('directory');
    setEditingStudent(student);
    setFormData({
      student_id: student.student_id,
      full_name: student.full_name,
      program: student.program,
      year_level: student.year_level,
      email: student.email,
    });
    setFormErrors({});
    setFormFocusTrigger((c) => c + 1);
  };

  const handleFocusForm = () => {
    setActiveView('directory');
    setMobileMenuOpen(false);
    setFormFocusTrigger((c) => c + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      showBanner(
        'warning',
        'Supabase Configuration Required',
        'Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file (or src/lib/supabase.ts) before saving records.'
      );
      return;
    }

    const payload: StudentFormData = {
      student_id: formData.student_id.trim(),
      full_name: formData.full_name.trim(),
      program: formData.program.trim(),
      year_level: formData.year_level.trim(),
      email: formData.email.trim(),
    };

    setIsSubmitting(true);
    setFormErrors({});

    try {
      if (editingStudent) {
        const { data, error } = await supabase
          .from('students')
          .update(payload)
          .eq('id', editingStudent.id)
          .select()
          .single();

        if (error) {
          const parsed = parseSupabaseError(error, payload.student_id);
          if (parsed.field) {
            setFormErrors({ [parsed.field]: parsed.message });
          }
          showBanner('error', 'Could Not Update Record', parsed.message);
          return;
        }

        const updated = data as Student;
        setStudents((prev) =>
          prev.map((item) => (item.id === editingStudent.id ? updated : item))
        );
        setEditingStudent(null);
        setFormData(EMPTY_FORM);
        showBanner(
          'success',
          'Record Updated',
          `${updated.full_name} (${updated.student_id}) has been updated in Supabase.`
        );
      } else {
        const { data, error } = await supabase
          .from('students')
          .insert([payload])
          .select()
          .single();

        if (error) {
          const parsed = parseSupabaseError(error, payload.student_id);
          if (parsed.field) {
            setFormErrors({ [parsed.field]: parsed.message });
          }
          showBanner('error', 'Could Not Save Record', parsed.message);
          return;
        }

        const inserted = data as Student;
        setStudents((prev) => [inserted, ...prev]);
        setFormData(EMPTY_FORM);
        showBanner(
          'success',
          'Student Saved',
          `${inserted.full_name} (${inserted.student_id}) has been added to the directory.`
        );
      }
    } catch (err) {
      const parsed = parseSupabaseError(err, payload.student_id);
      showBanner('error', 'Database Request Failed', parsed.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;

    if (!isSupabaseConfigured || !supabase) {
      showBanner(
        'warning',
        'Supabase Configuration Required',
        'Configure your Supabase credentials before deleting records.'
      );
      setStudentToDelete(null);
      return;
    }

    setIsDeleting(true);
    const target = studentToDelete;

    try {
      const { error } = await supabase.from('students').delete().eq('id', target.id);

      if (error) {
        const parsed = parseSupabaseError(error);
        showBanner('error', 'Could Not Delete Record', parsed.message);
        return;
      }

      setStudents((prev) => prev.filter((item) => item.id !== target.id));
      if (editingStudent?.id === target.id) {
        handleCancelEdit();
      }
      setStudentToDelete(null);
      showBanner(
        'success',
        'Record Deleted',
        `${target.full_name} (${target.student_id}) was permanently removed.`
      );
    } catch (err) {
      const parsed = parseSupabaseError(err);
      showBanner('error', 'Delete Failed', parsed.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSidebarYearSelect = (year: string) => {
    setActiveView('directory');
    setYearFilter(year);
    setMobileMenuOpen(false);
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-5 h-16 border-b border-slate-200 flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-blue-800 text-white flex items-center justify-center shrink-0">
          <GraduationCap className="w-4 h-4" />
        </div>
        <span className="font-semibold text-base tracking-tight text-slate-900 whitespace-nowrap">
          Academic Registry
        </span>
      </div>

      <nav aria-label="Primary navigation" className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-slate-500 mb-2">
            Directory Views
          </p>
          <button
            type="button"
            onClick={() => handleSidebarYearSelect('ALL')}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeView === 'directory' && yearFilter === 'ALL'
                ? 'bg-blue-50 text-blue-900'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="inline-flex items-center gap-2.5">
              <Users className="w-4 h-4 shrink-0" />
              <span>All Students</span>
            </span>
            <span className="font-mono tabular-nums text-xs text-slate-500">
              {students.length}
            </span>
          </button>

          {YEAR_LEVEL_OPTIONS.map((level) => {
            const isActive = activeView === 'directory' && yearFilter === level;
            return (
              <button
                key={level}
                type="button"
                onClick={() => handleSidebarYearSelect(level)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-50 text-blue-900'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className="inline-flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 shrink-0" />
                  <span>{level}</span>
                </span>
                <span className="font-mono tabular-nums text-xs text-slate-500">
                  {yearLevelCounts[level] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-200 space-y-1">
          <p className="px-3 text-xs font-semibold text-slate-500 mb-2">
            Database Configuration
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveView('setup');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeView === 'setup'
                ? 'bg-blue-50 text-blue-900'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="inline-flex items-center gap-2.5">
              <Database className="w-4 h-4 shrink-0" />
              <span>SQL &amp; Setup Guide</span>
            </span>
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-200 text-xs text-slate-500">
        <p className="font-medium text-slate-700">Supabase Cloud</p>
        <p className="mt-0.5">
          {isSupabaseConfigured ? 'Client configured' : 'Credentials required'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 bg-white border-r border-slate-200 shrink-0">
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden flex"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-64 max-w-[80vw] bg-white border-r border-slate-200 h-full">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close navigation menu"
              className="absolute top-4 right-3 p-1.5 text-slate-500 hover:text-slate-900 rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Shell */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-slate-500 whitespace-nowrap hidden sm:inline">
                Registrar
              </span>
              <span className="text-slate-300 hidden sm:inline" aria-hidden="true">
                /
              </span>
              <h1 className="font-semibold text-slate-900 truncate">
                {activeView === 'setup'
                  ? 'Supabase SQL & Environment Setup'
                  : 'Student Record Management'}
              </h1>
            </nav>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => fetchStudents(true)}
              disabled={!isSupabaseConfigured || isRefreshing || isLoading}
              className="inline-flex items-center gap-2 px-3.5 py-2 min-h-[38px] text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleFocusForm}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[38px] text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student</span>
            </button>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-[1440px] w-full mx-auto space-y-6">
          {/* Missing Credentials Notice */}
          {!isSupabaseConfigured && (
            <div
              role="status"
              className="bg-amber-50 border border-amber-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm font-semibold text-amber-950">
                    Supabase Credentials Not Configured
                  </h2>
                  <p className="text-sm text-amber-800 mt-0.5">
                    Add <code className="font-mono font-medium">VITE_SUPABASE_URL</code> and{' '}
                    <code className="font-mono font-medium">VITE_SUPABASE_ANON_KEY</code> to your{' '}
                    <code className="font-mono">.env</code> file (or{' '}
                    <code className="font-mono">src/lib/supabase.ts</code>) and run the{' '}
                    <code className="font-mono">students</code> table SQL script to enable cloud persistence.
                  </p>
                </div>
              </div>
              {activeView !== 'setup' && (
                <button
                  type="button"
                  onClick={() => setActiveView('setup')}
                  className="px-4 py-2 text-xs font-semibold text-amber-950 bg-white border border-amber-300 hover:bg-amber-100 rounded-lg transition-colors whitespace-nowrap shrink-0 self-start sm:self-center"
                >
                  View Setup Guide
                </button>
              )}
            </div>
          )}

          {/* Database Fetch Error Banner */}
          {dbLoadError && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm font-semibold text-red-950">
                    Unable to Load Records from Supabase
                  </h2>
                  <p className="text-sm text-red-800 mt-0.5">{dbLoadError}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveView('setup')}
                  className="px-3.5 py-2 text-xs font-semibold text-red-900 bg-white border border-red-300 hover:bg-red-100 rounded-lg transition-colors whitespace-nowrap"
                >
                  Check SQL Setup
                </button>
                <button
                  type="button"
                  onClick={() => fetchStudents(true)}
                  className="px-3.5 py-2 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors whitespace-nowrap"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Action Feedback Notification */}
          {banner && (
            <div
              role={banner.type === 'error' ? 'alert' : 'status'}
              className={`rounded-xl border p-4 flex items-start justify-between gap-4 ${
                banner.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : banner.type === 'warning'
                    ? 'bg-amber-50 border-amber-200 text-amber-950'
                    : 'bg-red-50 border-red-200 text-red-950'
              }`}
            >
              <div className="flex items-start gap-3">
                {banner.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                ) : banner.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-semibold">{banner.title}</p>
                  <p className="text-sm opacity-90 mt-0.5">{banner.message}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBanner(null)}
                aria-label="Dismiss notification"
                className="p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {activeView === 'setup' ? (
            <SetupGuidePanel
              isConfigured={isSupabaseConfigured}
              onBackToDirectory={() => setActiveView('directory')}
            />
          ) : (
            <>
              {/* Academic Summary Strip */}
              <div className="bg-white border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                <div className="px-6 py-4">
                  <p className="text-xs font-medium text-slate-500">Total Enrolled</p>
                  <p className="mt-1 text-2xl font-semibold font-mono tabular-nums text-slate-900">
                    {isLoading ? '—' : students.length}
                  </p>
                </div>
                <div className="px-6 py-4">
                  <p className="text-xs font-medium text-slate-500">Active Programs</p>
                  <p className="mt-1 text-2xl font-semibold font-mono tabular-nums text-slate-900">
                    {isLoading ? '—' : uniqueProgramsInRecords}
                  </p>
                </div>
                <div className="px-6 py-4">
                  <p className="text-xs font-medium text-slate-500">Directory Matches</p>
                  <p className="mt-1 text-2xl font-semibold font-mono tabular-nums text-slate-900">
                    {isLoading ? '—' : filteredAndSortedStudents.length}
                  </p>
                </div>
              </div>

              {/* Form + Table Workspace */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                <div className="xl:col-span-4 xl:sticky xl:top-6">
                  <StudentForm
                    formData={formData}
                    errors={formErrors}
                    editingStudent={editingStudent}
                    isSubmitting={isSubmitting}
                    isConfigured={isSupabaseConfigured}
                    onChange={handleFieldChange}
                    onSubmit={handleSubmit}
                    onCancelEdit={handleCancelEdit}
                    onReset={handleResetForm}
                    formFocusTrigger={formFocusTrigger}
                  />
                </div>

                <div className="xl:col-span-8">
                  <StudentTable
                    students={filteredAndSortedStudents}
                    totalCount={students.length}
                    isLoading={isLoading}
                    isConfigured={isSupabaseConfigured}
                    searchQuery={searchQuery}
                    programFilter={programFilter}
                    yearFilter={yearFilter}
                    availablePrograms={availablePrograms}
                    editingId={editingStudent?.id ?? null}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSearchChange={setSearchQuery}
                    onProgramFilterChange={setProgramFilter}
                    onYearFilterChange={setYearFilter}
                    onClearFilters={() => {
                      setSearchQuery('');
                      setProgramFilter('ALL');
                      setYearFilter('ALL');
                    }}
                    onSort={handleSort}
                    onEdit={handleStartEdit}
                    onDeleteRequest={setStudentToDelete}
                    onFocusForm={handleFocusForm}
                  />
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        student={studentToDelete}
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeleting) setStudentToDelete(null);
        }}
      />
    </div>
  );
}
