import React, { useEffect, useRef } from 'react';
import { AlertCircle, Check, Loader2, RotateCcw, Save, UserPen, UserPlus } from 'lucide-react';
import {
  COMMON_PROGRAMS,
  YEAR_LEVEL_OPTIONS,
  type FormErrors,
  type Student,
  type StudentFormData,
} from '../types/student';

interface StudentFormProps {
  formData: StudentFormData;
  errors: FormErrors;
  editingStudent: Student | null;
  isSubmitting: boolean;
  isConfigured: boolean;
  onChange: (field: keyof StudentFormData, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancelEdit: () => void;
  onReset: () => void;
  formFocusTrigger: number;
}

export function StudentForm({
  formData,
  errors,
  editingStudent,
  isSubmitting,
  isConfigured,
  onChange,
  onSubmit,
  onCancelEdit,
  onReset,
  formFocusTrigger,
}: StudentFormProps) {
  const studentIdInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (formFocusTrigger > 0) {
      studentIdInputRef.current?.focus();
    }
  }, [formFocusTrigger]);

  const isEditing = editingStudent !== null;

  return (
    <section
      aria-labelledby="student-form-heading"
      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
    >
      <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
            {isEditing ? <UserPen className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <h2
              id="student-form-heading"
              className="text-base font-semibold text-slate-900 truncate"
            >
              {isEditing ? 'Edit Student Record' : 'New Student Record'}
            </h2>
            <p className="text-xs text-slate-500 truncate">
              {isEditing
                ? `Updating ${editingStudent.full_name} (${editingStudent.student_id})`
                : 'Enter official student enrollment details'}
            </p>
          </div>
        </div>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            disabled={isSubmitting}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            Cancel Edit
          </button>
        )}
      </div>

      <form onSubmit={onSubmit} noValidate className="p-6 space-y-5">
        <div>
          <label
            htmlFor="student_id"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Student ID <span className="text-red-600" aria-hidden="true">*</span>
          </label>
          <input
            ref={studentIdInputRef}
            id="student_id"
            name="student_id"
            type="text"
            value={formData.student_id}
            onChange={(e) => onChange('student_id', e.target.value)}
            placeholder="e.g. 2026-00142"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.student_id)}
            aria-describedby={errors.student_id ? 'student_id-error' : undefined}
            className={`w-full px-3.5 py-2.5 text-sm font-mono tabular-nums rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700/20 ${
              errors.student_id
                ? 'border-red-500 focus:border-red-600'
                : 'border-slate-300 focus:border-blue-700'
            }`}
          />
          {errors.student_id && (
            <p
              id="student_id-error"
              role="alert"
              className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.student_id}</span>
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="full_name"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Full Name <span className="text-red-600" aria-hidden="true">*</span>
          </label>
          <input
            id="full_name"
            name="full_name"
            type="text"
            value={formData.full_name}
            onChange={(e) => onChange('full_name', e.target.value)}
            placeholder="e.g. Elena Marie Santos"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.full_name)}
            aria-describedby={errors.full_name ? 'full_name-error' : undefined}
            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700/20 ${
              errors.full_name
                ? 'border-red-500 focus:border-red-600'
                : 'border-slate-300 focus:border-blue-700'
            }`}
          />
          {errors.full_name && (
            <p
              id="full_name-error"
              role="alert"
              className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.full_name}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="program"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Program <span className="text-red-600" aria-hidden="true">*</span>
            </label>
            <input
              id="program"
              name="program"
              type="text"
              list="academic-programs-list"
              value={formData.program}
              onChange={(e) => onChange('program', e.target.value)}
              placeholder="e.g. BSIT, BSCS"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.program)}
              aria-describedby={errors.program ? 'program-error' : undefined}
              className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700/20 ${
                errors.program
                  ? 'border-red-500 focus:border-red-600'
                  : 'border-slate-300 focus:border-blue-700'
              }`}
            />
            <datalist id="academic-programs-list">
              {COMMON_PROGRAMS.map((prog) => (
                <option key={prog} value={prog} />
              ))}
            </datalist>
            {errors.program && (
              <p
                id="program-error"
                role="alert"
                className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.program}</span>
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="year_level"
              className="block text-sm font-medium text-slate-700 mb-1.5"
            >
              Year Level <span className="text-red-600" aria-hidden="true">*</span>
            </label>
            <select
              id="year_level"
              name="year_level"
              value={formData.year_level}
              onChange={(e) => onChange('year_level', e.target.value)}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.year_level)}
              aria-describedby={errors.year_level ? 'year_level-error' : undefined}
              className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700/20 ${
                errors.year_level
                  ? 'border-red-500 focus:border-red-600'
                  : 'border-slate-300 focus:border-blue-700'
              }`}
            >
              <option value="">Select year level</option>
              {YEAR_LEVEL_OPTIONS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            {errors.year_level && (
              <p
                id="year_level-error"
                role="alert"
                className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.year_level}</span>
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Email Address <span className="text-red-600" aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => onChange('email', e.target.value)}
            placeholder="e.g. elena.santos@university.edu"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border bg-white text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-700/20 ${
              errors.email
                ? 'border-red-500 focus:border-red-600'
                : 'border-slate-300 focus:border-blue-700'
            }`}
          />
          {errors.email && (
            <p
              id="email-error"
              role="alert"
              className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.email}</span>
            </p>
          )}
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[42px] text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isEditing ? 'Updating...' : 'Saving...'}</span>
              </>
            ) : isEditing ? (
              <>
                <Check className="w-4 h-4" />
                <span>Update</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save</span>
              </>
            )}
          </button>

          {isEditing ? (
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center px-4 py-2.5 min-h-[42px] text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              Cancel
            </button>
          ) : (
            <button
              type="button"
              onClick={onReset}
              disabled={isSubmitting}
              title="Clear form fields"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[42px] text-sm font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {!isConfigured && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Supabase credentials are not configured yet. Saving is disabled until you set{' '}
            <code className="font-mono font-medium">VITE_SUPABASE_URL</code> and{' '}
            <code className="font-mono font-medium">VITE_SUPABASE_ANON_KEY</code>.
          </p>
        )}
      </form>
    </section>
  );
}
