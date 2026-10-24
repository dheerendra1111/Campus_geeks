import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import itemService from '../services/itemService';
import {
  UploadCloud,
  X,
  Plus,
  Sparkles,
  MapPin,
  Tag,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const CATEGORIES = [
  'Electronics & Kits',
  'Lab Gear',
  'Textbooks & Notes',
  'Drafting & Tools',
  'Sports & Events',
  'Other / General',
];

const CONDITIONS = ['Brand New', 'Like New', 'Good', 'Fair'];

export const ListItemPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0],
    condition: 'Good',
    pricingType: 'FREE',
    pricePerDay: '',
    depositAmount: '',
    pickupLocation: 'Central Library / Main Campus Gate',
    description: '',
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [extraImages, setExtraImages] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (selectedFiles.length + files.length > 5) {
      setFormError('You can upload a maximum of 5 images per item.');
      return;
    }

    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);

    // Generate local previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setFilePreviews((prev) => [...prev, ...newPreviews]);
  };

  // Remove uploaded file
  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Add manual image URL (useful for quick online image paste)
  const addManualImage = () => {
    if (!manualImageUrl.trim()) return;
    setExtraImages((prev) => [...prev, manualImageUrl.trim()]);
    setManualImageUrl('');
  };

  const removeManualImage = (index) => {
    setExtraImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.title.trim()) {
      setFormError('Please provide an item title.');
      return;
    }

    if (!formData.description.trim()) {
      setFormError('Please provide a brief description.');
      return;
    }

    if (formData.pricingType === 'RENT_PER_DAY' && (!formData.pricePerDay || formData.pricePerDay <= 0)) {
      setFormError('Please specify a valid daily rental rate greater than 0.');
      return;
    }

    try {
      setIsSubmitting(true);

      // Use FormData to support file uploads
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('category', formData.category);
      data.append('condition', formData.condition);
      data.append('pricingType', formData.pricingType);
      data.append('pricePerDay', formData.pricingType === 'RENT_PER_DAY' ? formData.pricePerDay : 0);
      data.append('depositAmount', formData.depositAmount || 0);
      data.append('pickupLocation', formData.pickupLocation.trim());
      data.append('description', formData.description.trim());

      // Append files
      selectedFiles.forEach((file) => {
        data.append('images', file);
      });

      // Append any manual URLs
      extraImages.forEach((url) => {
        data.append('images', url);
      });

      const res = await itemService.createItem(data);
      if (res.success && res.data) {
        navigate(`/explore?category=${encodeURIComponent(formData.category)}`);
      }
    } catch (err) {
      setFormError(err.message || 'Failed to list item. Please check all fields.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-2 text-center sm:text-left">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          List an Item for Peers
        </h1>
        <p className="text-sm text-slate-500">
          Share your textbooks, lab gear, or electronic kits with students who need them.
        </p>
      </div>

      {formError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500 mt-0.5" />
          <span className="font-medium">{formError}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 space-y-8">
        {/* Section 1: Basic Info */}
        <div className="space-y-5">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
            1. Item Details
          </h2>

          <Input
            label="Item Title"
            name="title"
            placeholder="e.g. Casio fx-991ES Plus Scientific Calculator"
            value={formData.title}
            onChange={handleChange}
            required
            helperText="Include the brand or exact model name so peers find it quickly"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Condition <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CONDITIONS.map((cond) => (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, condition: cond }))}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                      formData.condition === cond
                        ? 'bg-brand-50 border-brand-500 text-brand-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {cond}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              name="description"
              rows={4}
              placeholder="Describe condition, what accessories are included (e.g. USB cable, manual, drafter cover), and any notes for the borrower..."
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white p-3.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              required
            />
          </div>

          <Input
            label="Preferred Handover Location"
            name="pickupLocation"
            placeholder="e.g. Central Library / Hostel 4 Lobby"
            value={formData.pickupLocation}
            onChange={handleChange}
            icon={MapPin}
            helperText="Where you prefer to meet on campus for the pickup"
          />
        </div>

        {/* Section 2: Photos */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
            2. Item Photos
          </h2>

          <div className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-3xl p-6 text-center space-y-3 transition-colors bg-slate-50/50">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <label
                htmlFor="file-upload"
                className="font-bold text-brand-600 hover:text-brand-700 cursor-pointer underline underline-offset-2"
              >
                Click to browse files
              </label>
              <span className="text-xs text-slate-500"> or drag and drop photos here</span>
            </div>
            <p className="text-[11px] text-slate-400">PNG, JPG, or WebP up to 5MB each (Max 5 photos)</p>
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Image Previews */}
          {(filePreviews.length > 0 || extraImages.length > 0) && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
              {filePreviews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group">
                  <img src={src} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {extraImages.map((src, i) => (
                <div key={`manual-${i}`} className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 group">
                  <img src={src} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeManualImage(i)}
                    className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-rose-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Quick Image URL paste option */}
          <div className="pt-2 flex gap-2">
            <input
              type="url"
              placeholder="Or paste an image URL directly..."
              value={manualImageUrl}
              onChange={(e) => setManualImageUrl(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
            />
            <Button variant="secondary" size="sm" onClick={addManualImage}>
              <Plus className="w-3.5 h-3.5" />
              Add URL
            </Button>
          </div>
        </div>

        {/* Section 3: Pricing & Deposit */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">
            3. Pricing & Terms
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, pricingType: 'FREE' }))}
              className={`p-4 rounded-2xl border text-left transition-all ${
                formData.pricingType === 'FREE'
                  ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-800 text-sm">Lend for Free</span>
                {formData.pricingType === 'FREE' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Help a junior peer for free. Great for textbooks or quick exam equipment.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, pricingType: 'RENT_PER_DAY' }))}
              className={`p-4 rounded-2xl border text-left transition-all ${
                formData.pricingType === 'RENT_PER_DAY'
                  ? 'border-brand-500 bg-brand-50/50 ring-2 ring-brand-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-brand-900 text-sm">Rent per Day</span>
                {formData.pricingType === 'RENT_PER_DAY' && (
                  <CheckCircle2 className="w-4 h-4 text-brand-600" />
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Charge a small nominal fee (e.g. ₹20/day) for high-value gear.
              </p>
            </button>
          </div>

          {formData.pricingType === 'RENT_PER_DAY' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Input
                label="Daily Rental Rate (₹)"
                name="pricePerDay"
                type="number"
                min="1"
                placeholder="e.g. 25"
                value={formData.pricePerDay}
                onChange={handleChange}
                required
              />

              <Input
                label="Refundable Security Deposit (₹)"
                name="depositAmount"
                type="number"
                min="0"
                placeholder="e.g. 200"
                value={formData.depositAmount}
                onChange={handleChange}
                helperText="Returned to the borrower once the item is inspected and returned"
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
          <Button
            variant="outline"
            size="md"
            className="w-full sm:w-auto"
            onClick={() => navigate('/explore')}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="campus"
            size="lg"
            isLoading={isSubmitting}
            className="w-full sm:w-auto px-8"
          >
            Publish Item Listing
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ListItemPage;
