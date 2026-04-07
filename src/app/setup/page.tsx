'use client';

import { useState, useEffect } from 'react';

export default function SetupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<any>(null);
  const [status, setStatus] = useState<any>(null);

  // Check health on mount
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealth(data);
    } catch (err: any) {
      setHealth({ 
        success: false, 
        status: 'error', 
        message: 'Impossible de contacter le serveur' 
      });
    }
  };

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/seed');
      const data = await res.json();
      setStatus(data);
    } catch (err: any) {
      console.error('Error checking status:', err);
    }
  };

  const seedDatabase = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || data.message || 'Une erreur est survenue');
      } else {
        setResult(data);
        // Refresh health after seeding
        setTimeout(checkHealth, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">KFM DELICE</h1>
            <p className="text-gray-500 mt-1">Configuration initiale</p>
          </div>

          {/* Health Status */}
          <div className={`mb-6 p-4 rounded-lg ${health?.success ? 'bg-green-50 border border-green-200' : health ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-2">
              {health ? (
                health.success ? (
                  <span className="text-green-600 text-lg">✅</span>
                ) : (
                  <span className="text-red-600 text-lg">❌</span>
                )
              ) : (
                <span className="text-gray-400 text-lg">⏳</span>
              )}
              <span className={`font-medium ${health?.success ? 'text-green-800' : health ? 'text-red-800' : 'text-gray-600'}`}>
                {health?.success ? 'Base de données connectée' : health ? 'Erreur de connexion' : 'Vérification...'}
              </span>
            </div>
            
            {health?.database && (
              <div className="text-sm text-gray-600 space-y-1">
                <p>Temps de réponse: {health.database.responseTime}</p>
                {health.database.stats && (
                  <p>Données: {health.database.stats.restaurants} restaurants, {health.database.stats.items} articles</p>
                )}
              </div>
            )}
            
            {health?.message && (
              <p className={`text-sm mt-2 ${health.success ? 'text-green-700' : 'text-red-700'}`}>
                {health.message}
              </p>
            )}

            {!health?.success && health?.help && (
              <div className="mt-3 p-3 bg-white rounded border text-xs text-gray-600">
                <p className="font-medium mb-1">Aide:</p>
                <ul className="list-disc list-inside space-y-1">
                  {health.help.map((h: string, i: number) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Status Check */}
          <button
            onClick={checkStatus}
            className="w-full mb-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Vérifier l'état de la base
          </button>

          {status && (
            <div className={`mb-4 p-4 rounded-lg ${status.needsSetup ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
              <p className={`text-sm ${status.needsSetup ? 'text-yellow-800' : 'text-green-800'}`}>
                {status.needsSetup ? '⚠️ ' : '✅ '}
                {status.message}
              </p>
              {status.stats && (
                <div className="mt-2 text-xs text-gray-600">
                  Menus: {status.stats.menus} | Catégories: {status.stats.categories} | Articles: {status.stats.items}
                </div>
              )}
            </div>
          )}

          {/* Seed Button - Only show if database is connected */}
          {health?.success && (
            <button
              onClick={seedDatabase}
              disabled={loading}
              className="w-full py-3 px-4 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Initialisation en cours...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Initialiser la base de données
                </>
              )}
            </button>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium mb-2">❌ Erreur</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Success Result */}
          {result && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium mb-2">✅ {result.message}</p>

              {result.stats && (
                <div className="text-sm text-gray-600 mb-3">
                  <p>Catégories créées: {result.stats.categoriesCreated}</p>
                  <p>Articles créés: {result.stats.itemsCreated}</p>
                  <p>Admin créé: {result.stats.adminCreated ? 'Oui' : 'Non (déjà existant)'}</p>
                  <p>Chauffeur créé: {result.stats.driverCreated ? 'Oui' : 'Non (déjà existant)'}</p>
                </div>
              )}

              {result.credentials && (
                <div className="mt-3 p-3 bg-white rounded border">
                  <p className="text-xs font-medium text-gray-500 mb-2">Identifiants Admin :</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Email:</span>
                      <code className="text-sm bg-gray-100 px-2 py-0.5 rounded">{result.credentials.email}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Mot de passe:</span>
                      <code className="text-sm bg-gray-100 px-2 py-0.5 rounded">{result.credentials.password}</code>
                    </div>
                  </div>
                  
                  {result.driverCredentials && (
                    <>
                      <p className="text-xs font-medium text-gray-500 mt-3 mb-2">Identifiants Chauffeur :</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Email:</span>
                          <code className="text-sm bg-gray-100 px-2 py-0.5 rounded">{result.driverCredentials.email}</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Mot de passe:</span>
                          <code className="text-sm bg-gray-100 px-2 py-0.5 rounded">{result.driverCredentials.password}</code>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              <a
                href="/login"
                className="mt-4 w-full py-2 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center gap-2 no-underline"
              >
                Se connecter
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          )}

          {/* Help for database issues */}
          {!health?.success && health && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">🔧 Configuration de la base de données</p>
              <ol className="text-xs text-blue-700 space-y-2 list-decimal list-inside">
                <li>Allez sur <strong>Render Dashboard</strong></li>
                <li>Selectionnez votre service web</li>
                <li>Allez dans <strong>Environment</strong></li>
                <li>Ajoutez/verifiez <code className="bg-blue-100 px-1 rounded">DATABASE_URL</code></li>
                <li>Verifiez que l&apos;URL Neon PostgreSQL est correcte</li>
                <li>Cliquez <strong>Save Changes</strong> pour redéployer</li>
              </ol>
            </div>
          )}

          {/* Refresh button */}
          <button
            onClick={checkHealth}
            className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Rafraîchir
          </button>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Restaurant OS - Configuration automatique
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
