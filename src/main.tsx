import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Broadcast Studio Error]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md p-6 bg-slate-900 border border-red-500/40 rounded-2xl shadow-2xl space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-950 flex items-center justify-center text-red-400 text-2xl font-bold">
              !
            </div>
            <h2 className="text-lg font-bold text-white">เกิดข้อผิดพลาดในการโหลดระบบ</h2>
            <p className="text-xs text-slate-400">
              {this.state.error?.message || 'Unable to render component'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-lg transition"
            >
              โหลดหน้าเว็บใหม่ (Reload)
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);
