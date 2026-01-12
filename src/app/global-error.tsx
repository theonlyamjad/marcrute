"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #061E29;
              color: #F3F4F4;
            }
          `
        }} />
      </head>
      <body>
        <div style={{minHeight: '100vh',display: 'flex',alignItems: 'center',justifyContent: 'center',padding: '1rem',backgroundColor: '#061E29'}}>
          <div style={{textAlign: 'center',maxWidth: '42rem'}}>
            <div style={{marginBottom: '2rem',width: '100%',height: '24rem',display: 'flex',alignItems: 'center',justifyContent: 'center'}}>
              <img src="/assets/images/error-critical.png"alt="Erreur critique"style={{maxWidth: '100%',maxHeight: '100%',objectFit: 'contain'}}/>
            </div>
            <h1 style={{fontSize: '4.5rem',fontWeight: 'bold',color: '#5F9598',marginBottom: '1rem'}}>
              Erreur
            </h1>
            <h2 style={{fontSize: '1.875rem',fontWeight: '600',color: '#F3F4F4',marginBottom: '1rem'}}>
              Erreur système
            </h2>
            <p style={{color: '#5F9598',marginBottom: '2rem',fontSize: '1.125rem'}}>
              Une erreur critique s'est produite. Veuillez actualiser la page.
            </p>
            <button
              onClick={reset}
              style={{padding: '0.75rem 2rem',backgroundColor: '#1D546D',color: '#F3F4F4',borderRadius: '0.5rem',border: 'none',fontSize: '1rem',fontWeight: '500',cursor: 'pointer',transition: 'background-color 0.2s'}}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#5F9598'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1D546D'}>
              Actualiser
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}