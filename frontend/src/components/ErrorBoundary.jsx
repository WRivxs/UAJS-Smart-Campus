import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-lg w-full text-center shadow-lg space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl">warning</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-space">
                No se pudo cargar este módulo
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Ocurrió un detalle al procesar la información de la sección. Puedes intentar recargarla.
              </p>
              {this.state.error?.message && (
                <div className="mt-3 p-2.5 rounded-xl bg-slate-50 text-[11px] font-mono text-slate-600 break-all border border-slate-100 text-left">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-5 py-2 rounded-xl bg-[#0a47b8] hover:bg-[#081f56] text-white text-xs font-bold font-space transition cursor-pointer"
              >
                Reintentar Carga
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

