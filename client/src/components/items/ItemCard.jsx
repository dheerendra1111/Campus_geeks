import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Tag, ShieldCheck, ArrowUpRight } from 'lucide-react';
import Badge from '../common/Badge';

export const ItemCard = ({ item }) => {
  const {
    _id,
    title,
    category,
    condition,
    images = [],
    pricingType,
    pricePerDay,
    depositAmount,
    status,
    owner,
    pickupLocation,
  } = item;

  const defaultImage =
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80';
  const displayImage = images.length > 0 ? images[0] : defaultImage;

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/80 hover:border-brand-500/40 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
      {/* Image Thumbnail Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
        <img
          src={displayImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = defaultImage;
          }}
        />

        {/* Status Badge Overlay */}
        <div className="absolute top-3 left-3">
          <Badge variant={status}>{status}</Badge>
        </div>

        {/* Condition Tag */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-slate-700 shadow-sm border border-slate-200/60">
          {condition}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Category Pill */}
          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200/50">
            {category}
          </span>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-base line-clamp-1 group-hover:text-brand-600 transition-colors">
            {title}
          </h3>

          {/* Pricing Info */}
          <div className="pt-1 flex items-baseline gap-2">
            {pricingType === 'FREE' ? (
              <span className="text-base font-extrabold text-emerald-600">
                Free to Borrow
              </span>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-slate-900">
                  ₹{pricePerDay}
                </span>
                <span className="text-xs font-semibold text-slate-500">/ day</span>
              </div>
            )}

            {depositAmount > 0 && (
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                ₹{depositAmount} deposit
              </span>
            )}
          </div>
        </div>

        {/* Footer: Owner and Location */}
        <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
          {pickupLocation && (
            <div className="flex items-center gap-1 text-slate-500 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{pickupLocation}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            {/* Owner snippet */}
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center border border-slate-200">
                {owner?.name ? owner.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700 max-w-[90px] truncate">
                  {owner?.name}
                </span>
                <div className="flex items-center text-amber-500 font-bold text-[11px]">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-0.5" />
                  {owner?.trustScore ? owner.trustScore.toFixed(1) : '5.0'}
                </div>
              </div>
            </div>

            {/* View / Request Button */}
            <Link
              to={`/items/${_id}`}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1.5 rounded-xl transition-colors"
            >
              <span>View</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
