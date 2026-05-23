import React, { useEffect, useState } from 'react';
import { partnersApi } from '../utils/api';

export const PartnersPage = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPartners = async () => {
      try {
        setLoading(true);
        const data = await partnersApi.getAll();
        setPartners(data || []);
        setError(null);
      } catch (err) {
        console.error('Failed to load partners:', err);
        setError('Failed to load partners');
      } finally {
        setLoading(false);
      }
    };

    loadPartners();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      <section className="py-12 md:py-16 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="page-container text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Our Partners</h1>
          <p className="text-white/90 text-lg">Meet the organizations that help us deliver amazing events.</p>
        </div>
      </section>

      <section className="page-container py-12 md:py-16">
        {loading ? (
          <div className="text-center text-gray-600 dark:text-gray-300">Loading partners...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : partners.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-300">No partners available yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner) => (
              <article
                key={partner.id}
                className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm p-6"
              >
                {partner.logo_url && (
                  <img
                    src={partner.logo_url}
                    alt={partner.name}
                    className="w-full h-28 object-contain mb-4"
                  />
                )}
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{partner.name}</h2>
                {partner.description && (
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{partner.description}</p>
                )}
                {partner.link && (
                  <a
                    href={partner.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-600 dark:text-primary-400 font-medium hover:underline"
                  >
                    Visit Website
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

PartnersPage.displayName = 'PartnersPage';
