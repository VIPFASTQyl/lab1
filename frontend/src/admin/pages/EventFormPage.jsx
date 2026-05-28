import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronLeft, Save } from 'lucide-react';
import { discountsApi, eventApi, organizersApi, relationsApi, uploadApi } from '../../utils/api';
import { DEFAULT_EVENT_IMAGE } from '../../constants';

export const EventFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = !!id;
  const event = location.state?.event;

  const [formData, setFormData] = useState(
    (event
      ? {
          ...event,
          EventDate: event.EventDate ? (event.EventDate.split('T')[0]) : '',
          // normalize ImageUrl key to ImageUrl if backend uses ImageUrl
          ImageUrl: event.ImageUrl || event.image || event.ImageURL || '',
          Price: event.Price || event.priceFrom || '',
          DiscountId: event.DiscountId || event.discountId || '',
        }
      : {
          Title: '',
          Category: '',
          Description: '',
          EventDate: '',
          StartTime: '',
          EndTime: '',
          VenueId: '',
          ImageUrl: '',
          Price: '',
          DiscountId: '',
        }
    )
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [venues, setVenues] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [selectedOrganizerId, setSelectedOrganizerId] = useState('');
  const [existingOrganizerRelationId, setExistingOrganizerRelationId] = useState('');
  const [initialOrganizerId, setInitialOrganizerId] = useState('');
  const [selectedDiscountId, setSelectedDiscountId] = useState(String(event?.DiscountId || event?.discountId || ''));
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchVenues();
    fetchDiscounts();
    fetchOrganizers();
    if (isEdit && id) {
      fetchEventOrganizers();
    }
  }, []);

  const fetchVenues = async () => {
    try {
      const response = await eventApi.getVenues();
      setVenues(response || []);
    } catch (err) {
      console.error('Failed to fetch venues:', err);
    }
  };

  const fetchOrganizers = async () => {
    try {
      const response = await organizersApi.getAll();
      setOrganizers(response || []);
    } catch (err) {
      console.error('Failed to fetch organizers:', err);
    }
  };

  const fetchDiscounts = async () => {
    try {
      const response = await discountsApi.getAll();
      setDiscounts(response || []);
    } catch (err) {
      console.error('Failed to fetch discounts:', err);
    }
  };

  const fetchEventOrganizers = async () => {
    try {
      const response = await relationsApi.getEventOrganizers({ eventId: id });
      const relation = Array.isArray(response) ? response[0] : null;
      const organizerId = relation?.OrganizerId ? String(relation.OrganizerId) : '';
      const relationId = relation?.EventOrganizerId ? String(relation.EventOrganizerId) : '';
      setSelectedOrganizerId(organizerId);
      setInitialOrganizerId(organizerId);
      setExistingOrganizerRelationId(relationId);
    } catch (err) {
      console.error('Failed to fetch event organizers:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append('file', file);
      const res = await uploadApi.uploadImage(fd);
      const url = res?.url || res?.data?.url || (res && res[0] && res[0].url) || res;
      if (url) setFormData(prev => ({ ...prev, ImageUrl: url }));
    } catch (err) {
      console.error('Upload failed:', err);
      if (err.response?.status === 404) {
        setError('Upload endpoint not found (POST /api/uploads returned 404). Is the backend running?');
      } else if (err.response?.status === 401) {
        setError('Unauthorized. Please log in as admin before uploading images.');
      } else {
        setError('Image upload failed');
      }
    } finally {
      setUploading(false);
    }
  };

  const syncOrganizerRelation = async (eventIdValue) => {
    const organizerIdValue = selectedOrganizerId ? Number(selectedOrganizerId) : null;
    const originalOrganizerIdValue = initialOrganizerId ? Number(initialOrganizerId) : null;

    if (!organizerIdValue) {
      if (isEdit && existingOrganizerRelationId) {
        await relationsApi.deleteEventOrganizer(existingOrganizerRelationId);
        setExistingOrganizerRelationId('');
        setInitialOrganizerId('');
      }
      return;
    }

    if (!isEdit) {
      await relationsApi.createEventOrganizer({ eventId: Number(eventIdValue), organizerId: organizerIdValue });
      return;
    }

    if (existingOrganizerRelationId) {
      if (originalOrganizerIdValue === organizerIdValue) {
        return;
      }

      await relationsApi.deleteEventOrganizer(existingOrganizerRelationId);
      setExistingOrganizerRelationId('');
    }

    const createdRelation = await relationsApi.createEventOrganizer({ eventId: Number(eventIdValue), organizerId: organizerIdValue });
    if (createdRelation?.EventOrganizerId) {
      setExistingOrganizerRelationId(String(createdRelation.EventOrganizerId));
      setInitialOrganizerId(String(organizerIdValue));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (!formData.Title || !formData.EventDate || !formData.VenueId) {
        setError('Title, Event Date, and Venue are required');
        setLoading(false);
        return;
      }

      const eventPayload = {
        ...formData,
        DiscountId: selectedDiscountId ? Number(selectedDiscountId) : null,
      };

      if (isEdit) {
        await eventApi.update(id, eventPayload);
      } else {
        const createdEvent = await eventApi.create(eventPayload);
        const createdEventId = createdEvent?.EventId || createdEvent?.eventId || createdEvent?.id;
        if (selectedOrganizerId && createdEventId) {
          await syncOrganizerRelation(createdEventId);
        }
        navigate('/admin/events');
        return;
      }

      if (selectedOrganizerId || (isEdit && existingOrganizerRelationId)) {
        await syncOrganizerRelation(id);
      }
      
      navigate('/admin/events');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save event');
      console.error('Error saving event:', err);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/events')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
        >
          <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isEdit ? 'Edit Event' : 'Create New Event'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isEdit ? `Edit event details` : 'Add a new event to your platform'}
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Event Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              name="Title"
              value={formData.Title}
              onChange={handleChange}
              placeholder="e.g., Summer Music Festival"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Category & Venue */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                name="Category"
                value={formData.Category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                <option value="Concert">Concert</option>
                <option value="Sports">Sports</option>
                <option value="Theater">Theater</option>
                <option value="Festival">Festival</option>
                <option value="Workshop">Workshop</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Discount
              </label>
              <select
                value={selectedDiscountId}
                onChange={(e) => setSelectedDiscountId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No Discount</option>
                {discounts.map((discount) => (
                  <option key={discount.DiscountId} value={discount.DiscountId}>
                    {discount.Code} - {discount.Percentage}%
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Venue *
              </label>
              <select
                name="VenueId"
                value={formData.VenueId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Venue</option>
                {venues.map(venue => (
                  <option key={venue.VenueId} value={venue.VenueId}>
                    {venue.Name} - {venue.City}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Organizer
              </label>
              <select
                name="OrganizerId"
                value={selectedOrganizerId}
                onChange={(e) => setSelectedOrganizerId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Organizer</option>
                {organizers.map((organizer) => (
                  <option key={organizer.OrganizerId} value={organizer.OrganizerId}>
                    {organizer.Name}{organizer.OrganizerType ? ` - ${organizer.OrganizerType}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Event Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Event Date *
            </label>
            <input
              type="date"
              name="EventDate"
              value={formData.EventDate ? (String(formData.EventDate).split('T')[0]) : ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Start & End Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start Time
              </label>
              <input
                type="time"
                name="StartTime"
                value={formData.StartTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                End Time
              </label>
              <input
                type="time"
                name="EndTime"
                value={formData.EndTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="Description"
              value={formData.Description}
              onChange={handleChange}
              placeholder="Event description..."
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Price
            </label>
            <input
              type="number"
              name="Price"
              value={formData.Price}
              onChange={handleChange}
              placeholder="e.g. 49.99"
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/40 p-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount</p>
            <p className="text-gray-900 dark:text-white">
              {selectedDiscountId
                ? (() => {
                    const selectedDiscount = discounts.find((discount) => String(discount.DiscountId) === String(selectedDiscountId));
                    return selectedDiscount ? `${selectedDiscount.Code} - ${Number(selectedDiscount.Percentage || 0)}%` : 'Selected discount';
                  })()
                : 'No discount selected'}
            </p>
          </div>

          {/* Upload Image File */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full"
            />
            {uploading && <div className="text-sm text-gray-600 mt-2">Uploading...</div>}
          </div>

          {formData.ImageUrl && (
            <div className="border border-gray-300 dark:border-slate-600 rounded-lg p-4">
              <img
                  src={formData.ImageUrl || DEFAULT_EVENT_IMAGE}
                  alt="Event"
                  onError={(e) => (e.target.src = DEFAULT_EVENT_IMAGE)}
                  className="w-full h-64 object-cover rounded"
                />
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => navigate('/admin/events')}
              className="px-6 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition ml-auto"
            >
              <Save className="h-5 w-5" />
              {loading ? 'Saving...' : (isEdit ? 'Update Event' : 'Create Event')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormPage;
