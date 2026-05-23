import React, { useEffect, useState } from 'react';
import { Edit2, Trash2, Upload } from 'lucide-react';
import { DataTable } from '../components/common';
import { Button } from '../../components/ui';
import { partnersApi, uploadApi } from '../../utils/api';

export const AdminPartnersPage = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    link: '',
    description: '',
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');

  const fetchPartners = async () => {
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

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (partner) => {
    setEditing(partner.id);
    setFormData({
      name: partner.name || '',
      logo_url: partner.logo_url || '',
      link: partner.link || '',
      description: partner.description || '',
    });
    setLogoFile(null);
    setLogoPreview(partner.logo_url || '');
  };

  const handleCancel = () => {
    setEditing(null);
    setFormData({ name: '', logo_url: '', link: '', description: '' });
    setLogoFile(null);
    setLogoPreview('');
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    setLogoFile(file);
    setError(null);

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoPreview(event.target?.result || '');
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      setUploading(true);
      const formDataToUpload = new FormData();
      formDataToUpload.append('file', file);
      const res = await uploadApi.uploadImage(formDataToUpload);
      const url = res?.url || res?.data?.url || (res && res[0] && res[0].url) || res;
      if (url) {
        setFormData((prev) => ({ ...prev, logo_url: url }));
      }
      setLogoFile(null);
    } catch (err) {
      console.error('Failed to upload logo:', err);
      setError('Failed to upload image. Please try again.');
      setLogoPreview('');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Partner name is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (editing) {
        // Update existing partner
        await partnersApi.update(editing, {
          name: formData.name.trim(),
          logo_url: formData.logo_url.trim() || null,
          link: formData.link.trim() || null,
          description: formData.description.trim() || null,
        });
      } else {
        // Create new partner
        await partnersApi.create({
          name: formData.name.trim(),
          logo_url: formData.logo_url.trim() || null,
          link: formData.link.trim() || null,
          description: formData.description.trim() || null,
        });
      }

      setFormData({ name: '', logo_url: '', link: '', description: '' });
      setEditing(null);
      setLogoFile(null);
      setLogoPreview('');
      await fetchPartners();
    } catch (err) {
      console.error('Failed to save partner:', err);
      setError(err.response?.data?.message || 'Failed to save partner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (partner) => {
    if (window.confirm(`Delete partner ${partner.name}?`)) {
      const runDelete = async () => {
        try {
          setError(null);
          await partnersApi.delete(partner.id);
          setPartners((prev) => prev.filter((p) => p.id !== partner.id));
        } catch (err) {
          console.error('Failed to delete partner:', err);
          setError(err.response?.data?.message || 'Failed to delete partner');
        }
      };
      runDelete();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Partners Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage event partners and sponsors</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          {editing ? 'Edit Partner' : 'Add New Partner'}
        </h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Partner Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Partner name"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Logo Image
              </label>
              <label className="flex items-center justify-center gap-2 w-full px-3 py-2 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-600 transition">
                <Upload className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {logoFile ? logoFile.name : 'Choose image'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {logoPreview && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Logo Preview
              </label>
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
                <img
                  src={logoPreview}
                  alt="Logo preview"
                  className="h-16 w-auto max-w-[100px] object-contain"
                />
                {uploading && <span className="text-sm text-gray-500 dark:text-gray-400">Uploading...</span>}
                {!uploading && formData.logo_url && (
                  <span className="text-sm text-green-600 dark:text-green-400">✓ Image ready</span>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Website Link
            </label>
            <input
              type="url"
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Partner description"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Update Partner' : 'Add Partner'}
            </Button>
            {editing && (
              <Button type="button" variant="secondary" onClick={handleCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading partners...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Website</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Logo</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {partners.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No partners yet. Add one to get started.
                    </td>
                  </tr>
                ) : (
                  partners.map((partner) => (
                    <tr key={partner.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{partner.name}</td>
                      <td className="px-6 py-4 text-sm">
                        {partner.link ? (
                          <a
                            href={partner.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {partner.link.replace('https://', '').replace('http://', '')}
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {partner.logo_url ? (
                          <img
                            src={partner.logo_url}
                            alt={partner.name}
                            className="h-8 w-auto max-w-[100px]"
                          />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2">
                        <button
                          onClick={() => handleEdit(partner)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(partner)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
