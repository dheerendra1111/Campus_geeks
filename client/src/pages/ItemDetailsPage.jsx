import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import itemService from '../services/itemService';
import requestService from '../services/requestService';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Calendar,
  Star,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  User,
  Tag,
  Building,
} from 'lucide-react';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

export const ItemDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Booking Form State
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(nextWeek);
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Fetch item details on mount
  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await itemService.getItemById(id);
        if (res.success && res.data) {
          setItem(res.data);
        }
      } catch (err) {
        setError(err.message || 'Equipment item not found');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  // Compute duration and cost dynamically
  const calculateCost = () => {
    if (item?.pricingType === 'FOR_SALE') {
      const salePrice = item?.price || item?.pricePerDay || 0;
      return { days: 1, rentalCost: salePrice, total: salePrice };
    }

    if (!startDate || !endDate) return { days: 0, rentalCost: 0, total: 0 };
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end <= start) return { days: 0, rentalCost: 0, total: 0 };

    const diffTime = Math.abs(end - start);
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const rentalCost =
      item?.pricingType === 'RENT_PER_DAY' ? days * (item?.pricePerDay || 0) : 0;
    const total = rentalCost + (item?.depositAmount || 0);

    return { days, rentalCost, total };
  };

  const { days, rentalCost, total } = calculateCost();

  const isOwner = user && item && item.owner?._id === user._id;

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestError('');

    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/items/${id}` } } });
      return;
    }

    if (days <= 0) {
      setRequestError('Return date must be strictly after the pickup date.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await requestService.createRequest({
        itemId: id,
        startDate,
        endDate,
        purpose,
      });

      if (res.success) {
        setRequestSuccess(true);
      }
    } catch (err) {
      setRequestError(err.message || 'Failed to submit borrow request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading equipment details...</p>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-8 bg-rose-50 rounded-3xl border border-rose-200 text-rose-700 space-y-2">
          <AlertCircle className="w-8 h-8 mx-auto text-rose-500" />
          <h2 className="text-lg font-bold">Item Not Found</h2>
          <p className="text-xs text-rose-600">{error || 'This listing does not exist or has been removed.'}</p>
        </div>
        <Link to="/explore">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4" />
            Back to Catalog
          </Button>
        </Link>
      </div>
    );
  }

  const defaultImage =
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80';
  const images = item.images && item.images.length > 0 ? item.images : [defaultImage];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Explore
        </Link>
      </div>

      {/* Main Grid: Left Column Gallery & Details, Right Column Sticky Booking Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Main Photo Gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
              <img
                src={images[activeImageIndex] || defaultImage}
                alt={item.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute top-4 left-4">
                <Badge variant={item.status} size="lg">
                  {item.status}
                </Badge>
              </div>
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm">
                Condition: {item.condition}
              </div>
            </div>

            {/* Thumbnail Selectors */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveImageIndex(index)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      activeImageIndex === index
                        ? 'border-brand-600 scale-105 shadow-md'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Info Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 w-fit px-2.5 py-1 rounded-md border border-brand-200/50">
              <Tag className="w-3.5 h-3.5" />
              <span>{item.category}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {item.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{item.pickupLocation}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Listed {new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-slate-900">About this item</h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {item.description}
            </p>
          </div>

          {/* Lender Profile Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Lender Reputation & Campus ID
            </h2>

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white font-extrabold text-base flex items-center justify-center shadow-md shadow-brand-500/20">
                  {item.owner?.name ? item.owner.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{item.owner?.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.owner?.department}</span>
                    <span>•</span>
                    <span>ID: {item.owner?.collegeId}</span>
                  </div>
                </div>
              </div>

              {/* Trust Score Badge */}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-xl text-sm font-extrabold border border-amber-200/60 shadow-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{item.owner?.trustScore ? item.owner.trustScore.toFixed(1) : '5.0'}</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 font-medium">
                  {item.owner?.totalReviews || 0} reviews ({item.owner?.totalLends || 0} lends)
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-2.5 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                Verified student in {item.owner?.department}. Phone number is shared once the request is approved.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Booking Request Box (5 cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
            {/* Price Header */}
            <div className="border-b border-slate-100 pb-5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {item.pricingType === 'FOR_SALE' ? 'Purchase Terms' : 'Rental Terms'}
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                {item.pricingType === 'FREE' ? (
                  <div className="text-2xl font-black text-emerald-600">Free to Borrow / Take</div>
                ) : item.pricingType === 'FOR_SALE' ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-slate-900">
                      ₹{item.price || item.pricePerDay}
                    </span>
                    <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200/60">
                      Fixed Sale Price
                    </span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">₹{item.pricePerDay}</span>
                    <span className="text-sm font-semibold text-slate-500">/ day</span>
                  </div>
                )}

                {item.depositAmount > 0 && item.pricingType !== 'FOR_SALE' && (
                  <div className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-xl">
                    ₹{item.depositAmount} Deposit
                  </div>
                )}
              </div>
            </div>

            {/* If Current User is Owner */}
            {isOwner ? (
              <div className="p-4 bg-brand-50 border border-brand-200 rounded-2xl space-y-2 text-center">
                <p className="text-xs font-bold text-brand-800">You listed this equipment</p>
                <p className="text-xs text-brand-600">
                  Manage incoming requests from peers in your Dashboard.
                </p>
                <Link to="/dashboard">
                  <Button variant="primary" size="sm" className="w-full mt-2">
                    Go to My Dashboard
                  </Button>
                </Link>
              </div>
            ) : item.status === 'BORROWED' ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1 text-center">
                <p className="text-xs font-bold text-amber-800">Currently in active borrow session</p>
                <p className="text-xs text-amber-600">
                  This item is currently checked out by a peer. Check back soon!
                </p>
              </div>
            ) : requestSuccess ? (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3 animate-in fade-in">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-emerald-900">
                  {item.pricingType === 'FOR_SALE' ? 'Purchase Request Sent!' : 'Borrow Request Sent!'}
                </h3>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  {item.owner?.name} has been notified. Once approved, you can coordinate pickup
                  directly via WhatsApp.
                </p>
                <Link to="/dashboard">
                  <Button variant="campus" size="sm" className="w-full">
                    View on My Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              /* Booking Form */
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                {requestError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                    <span>{requestError}</span>
                  </div>
                )}

                {/* Date Pickers */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {item.pricingType === 'FOR_SALE' ? 'Meetup Date' : 'Pickup Date'}
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {item.pricingType === 'FOR_SALE' ? 'Target Handover' : 'Return Date'}
                    </label>
                    <input
                      type="date"
                      min={startDate || today}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-brand-500"
                      required
                    />
                  </div>
                </div>

                {/* Purpose Note */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {item.pricingType === 'FOR_SALE' ? 'Note for Seller' : 'Purpose / Note for Lender'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={item.pricingType === 'FOR_SALE' ? "e.g. Can meet near campus library to buy this item" : "e.g. Need for Math exam on Friday morning, will return by 4 PM"}
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                  />
                </div>

                {/* Cost Breakdown */}
                {item.pricingType === 'FOR_SALE' ? (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Listing Type:</span>
                      <span className="font-bold text-brand-700">Campus Sale</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Exact Selling Price:</span>
                      <span className="font-bold text-slate-900">₹{item.price || item.pricePerDay}</span>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-slate-900">
                      <span>Total on Handover:</span>
                      <span className="text-brand-600 font-extrabold">₹{item.price || item.pricePerDay}</span>
                    </div>
                  </div>
                ) : (
                  days > 0 && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Duration:</span>
                        <span className="font-bold text-slate-900">{days} {days === 1 ? 'day' : 'days'}</span>
                      </div>

                      {item.pricingType === 'RENT_PER_DAY' && (
                        <div className="flex justify-between text-slate-600">
                          <span>Daily Rental (₹{item.pricePerDay} × {days}d):</span>
                          <span className="font-bold text-slate-900">₹{rentalCost}</span>
                        </div>
                      )}

                      {item.depositAmount > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Refundable Deposit:</span>
                          <span className="font-bold text-emerald-700">+ ₹{item.depositAmount}</span>
                        </div>
                      )}

                      <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-sm text-slate-900">
                        <span>Total on Pickup:</span>
                        <span className="text-brand-600 font-extrabold">₹{total}</span>
                      </div>
                    </div>
                  )
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  className="w-full justify-center text-sm"
                >
                  {isAuthenticated
                    ? item.pricingType === 'FOR_SALE'
                      ? 'Request to Buy Item'
                      : 'Submit Borrow Request'
                    : item.pricingType === 'FOR_SALE'
                    ? 'Sign In to Buy'
                    : 'Sign In to Request'}
                </Button>

                <p className="text-[11px] text-center text-slate-400">
                  {item.pricingType === 'FOR_SALE'
                    ? 'No online payment required. Pay seller in cash or UPI during in-person handoff.'
                    : 'No payment required now. Coordinate deposit & terms in person on campus.'}
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailsPage;
