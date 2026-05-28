import React, { useEffect, useState } from 'react';
import { DataTable } from '../components/common';
import { Button } from '../../components/ui';
import { discountsApi } from '../../utils/api';

export const DiscountsPage = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    Code: '',
    Description: '',
    Percentage: '',
    StartDate: '',
    EndDate: '',
  });

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const data = await discountsApi.getAll();
      setDiscounts((data || []).map((discount) => ({
        id: discount.DiscountId,
        code: discount.Code,
        description: discount.Description || '',
        percentage: Number(discount.Percentage || 0),
        startDate: discount.StartDate ? String(discount.StartDate).split('T')[0] : '',
        endDate: discount.EndDate ? String(discount.EndDate).split('T')[0] : '',
      })));
      setError(null);
    } catch (err) {
      console.error('Failed to load discounts:', err);
      setError('Failed to load discounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.Code.trim() || formData.Percentage === '' || !formData.StartDate || !formData.EndDate) {
      setError('Code, Percentage, Start Date, and End Date are required');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await discountsApi.create({
        code: formData.Code.trim(),
        description: formData.Description.trim() || null,
        percentage: Number(formData.Percentage),
        startDate: formData.StartDate,
        endDate: formData.EndDate,
      });
      setFormData({ Code: '', Description: '', Percentage: '', StartDate: '', EndDate: '' });
      await fetchDiscounts();
    } catch (err) {
      console.error('Failed to create discount:', err);
      setError(err.response?.data?.message || 'Failed to add discount');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (discount) => {
    const runDelete = async () => {
      try {
        setError(null);
        await discountsApi.delete(discount.id);
        setDiscounts((prev) => prev.filter((item) => item.id !== discount.id));
      } catch (err) {
        console.error('Failed to delete discount:', err);
        setError(err.response?.data?.message || 'Failed to delete discount');
      }
    };

    if (window.confirm(`Delete discount ${discount.code}?`)) {
      runDelete();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Discounts Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Create and manage event discount codes</p>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add New Discount</h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            name="Code"
            value={formData.Code}
            onChange={handleChange}
            placeholder="Code"
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            required
          />
          <input
            type="text"
            name="Description"
            value={formData.Description}
            onChange={handleChange}
            placeholder="Description"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          />
          <input
            type="number"
            name="Percentage"
            min="0"
            max="100"
            step="0.01"
            value={formData.Percentage}
            onChange={handleChange}
            placeholder="Percentage"
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            required
          />
          <input
            type="date"
            name="StartDate"
            value={formData.StartDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            required
          />
          <input
            type="date"
            name="EndDate"
            value={formData.EndDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            required
          />
          <div className="md:col-span-5">
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? 'Saving...' : 'Add Discount'}
            </Button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 text-center text-gray-600 dark:text-gray-300">
          Loading discounts...
        </div>
      ) : (
        <DataTable
          title="All Discounts"
          columns={[
            { key: 'code', label: 'Code', sortable: true },
            { key: 'description', label: 'Description', sortable: true },
            { key: 'percentage', label: 'Percentage', sortable: true, render: (val) => `${Number(val || 0)}%` },
            { key: 'startDate', label: 'Start Date', sortable: true },
            { key: 'endDate', label: 'End Date', sortable: true },
          ]}
          data={discounts}
          searchable={true}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};
