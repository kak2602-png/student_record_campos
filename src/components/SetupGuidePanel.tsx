import { useState } from 'react';
import { Check, Copy, Database, FileCode2, KeyRound, Terminal } from 'lucide-react';
import { SETUP_SQL } from '../lib/supabase';

interface SetupGuidePanelProps {
  isConfigured: boolean;
  onBackToDirectory: () => void;
}

export function SetupGuidePanel({
  isConfigured,
  onBackToDirectory,
}: SetupGuidePanelProps) {
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);

  const envSnippet = `VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-public-key"`;

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(SETUP_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  };

  const handleCopyEnv = async () => {
    try {
      await navigator.clipboard.writeText(envSnippet);
      setCopiedEnv(true);
      setTimeout(() => setCopiedEnv(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Supabase Database Configuration
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Connect your Supabase project and initialize the <code className="font-mono text-slate-800">students</code> table for persistent cloud storage.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-medium ${
                isConfigured ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {isConfigured ? 'Credentials Detected' : 'Awaiting Credentials'}
            </span>
            <button
              type="button"
              onClick={onBackToDirectory}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors whitespace-nowrap"
            >
              Return to Directory
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
          {/* Step 1: SQL Schema */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Database className="w-4 h-4 text-blue-800" />
                <span>1. Create the students table (SQL Editor)</span>
              </div>
              <button
                type="button"
                onClick={handleCopySql}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy SQL</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Open your Supabase project dashboard, navigate to <strong>SQL Editor</strong>, and
              execute this query to create the <code className="font-mono">students</code> table
              with RLS disabled for direct CRUD access.
            </p>
            <pre className="p-4 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
              <code>{SETUP_SQL}</code>
            </pre>
          </div>

          {/* Step 2: Environment Variables */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <KeyRound className="w-4 h-4 text-blue-800" />
                  <span>2. Add Project URL &amp; Anon Key</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyEnv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
                >
                  {copiedEnv ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy .env</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                In Supabase, go to <strong>Project Settings &rarr; API</strong>. Copy your{' '}
                <strong>Project URL</strong> and <strong>anon public</strong> key into a{' '}
                <code className="font-mono">.env</code> file in the project root:
              </p>
              <pre className="p-4 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed">
                <code>{envSnippet}</code>
              </pre>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <FileCode2 className="w-4 h-4 text-slate-600" />
                <span>Alternative: Direct Configuration File</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                You can also paste your credentials directly into{' '}
                <code className="font-mono text-slate-800">FALLBACK_SUPABASE_URL</code> and{' '}
                <code className="font-mono text-slate-800">FALLBACK_SUPABASE_ANON_KEY</code> inside{' '}
                <code className="font-mono text-slate-800">src/lib/supabase.ts</code>.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <Terminal className="w-4 h-4 text-slate-600" />
                <span>Column Mapping Summary</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1 font-mono">
                <li>id &rarr; bigint primary key (auto-generated)</li>
                <li>student_id &rarr; text unique not null</li>
                <li>full_name &rarr; text not null</li>
                <li>program &rarr; text not null</li>
                <li>year_level &rarr; text not null</li>
                <li>email &rarr; text not null</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
