export type YearLevel = '1st Year' | '2nd Year' | '3rd Year' | '4th Year' | '5th Year';

export const YEAR_LEVEL_OPTIONS: YearLevel[] = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
  '5th Year',
];

export const COMMON_PROGRAMS = [
  'BSIT',
  'BSCS',
  'BSIS',
  'BSCpE',
  'BSECE',
  'BSBA',
  'BSA',
  'BSED',
];

export interface Student {
  id: number | string;
  student_id: string;
  full_name: string;
  program: string;
  year_level: string;
  email: string;
  created_at?: string;
}

export interface StudentFormData {
  student_id: string;
  full_name: string;
  program: string;
  year_level: string;
  email: string;
}

export type FormErrors = Partial<Record<keyof StudentFormData, string>>;

export interface StatusBanner {
  id: number;
  type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
}
