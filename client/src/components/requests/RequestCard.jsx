import React from 'react';
import {
  Calendar,
  MapPin,
  Phone,
  MessageCircle,
  Star,
  Check,
  X,
  Repeat,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

export const RequestCard = ({
  request,
  role, // 'LENDER' or 'BORROWER'
  onStatusChange,
  onOpenReviewModal,
  isUpdating = false,
}) => {
  const {
    _id,
    item,
    lender,
    borrower,
    startDate,
    endDate,
    totalDays,
    estimatedCost,
    depositAmount,
    status,
    purpose,
  } = request;

  const partner = role === 'LENDER' ? borrower : lender;
  const partnerRoleLabel = role === 'LENDER' ? 'Borrower' : 'Lender';

  // Format WhatsApp Link
  const rawPhone = partner?.phone || '';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const waMessage = encodeURIComponent(
    `Hi ${partner?.name || 'peer'}, I'm reaching out regarding "${item?.title}" on CampusGeeks.`
  );
  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${waMessage}` : null;

  const defaultImage =
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80';
  const itemImage = item?.images && item.images.length > 0 ? item.images[0] : defaultImage;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all p-5 sm:p-6 flex flex-col justify-between space-y-4">
      {/* Top Header: Item Snippet & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
            <img src={itemImage} alt={item?.title} className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
              {item?.category}
            </span>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1 mt-0.5">
              {item?.title}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>Condition: <strong>{item?.condition}</strong></span>
              {item?.pickupLocation && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {item?.pickupLocation}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div>
          <Badge variant={status} size="md">
            {status}
          </Badge>
        </div>
      </div>

      {/* Middle Grid: Dates & Partner Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Dates & Financials */}
        <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Borrow Duration:</span>
            <span className="font-bold text-slate-800">
              {totalDays} {totalDays === 1 ? 'day' : 'days'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Dates:</span>
            <span className="font-semibold text-slate-700">
              {new Date(startDate).toLocaleDateString()} → {new Date(endDate).toLocaleDateString()}
            </span>
          </div>
          <div className="border-t border-slate-200 pt-1.5 flex items-center justify-between font-bold">
            <span className="text-slate-600">Total Handoff Cost:</span>
            <span className="text-brand-600 text-sm">
              ₹{estimatedCost + (depositAmount || 0)}
              {depositAmount > 0 && (
                <span className="text-[10px] text-slate-400 ml-1 font-normal">
                  (incl. ₹{depositAmount} deposit)
                </span>
              )}
            </span>
          </div>
          {purpose && (
            <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-100">
              "{purpose}"
            </p>
          )}
        </div>

        {/* Peer Profile & WhatsApp Connect */}
        <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {partnerRoleLabel} Profile
            </span>
            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center">
                  {partner?.name ? partner.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-xs">{partner?.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {partner?.department} ({partner?.collegeId})
                  </p>
                </div>
              </div>

              <div className="flex items-center text-amber-500 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                {partner?.trustScore ? partner.trustScore.toFixed(1) : '5.0'}
              </div>
            </div>
          </div>

          {/* WhatsApp Action (Available once request is APPROVED or ACTIVE) */}
          {['APPROVED', 'ACTIVE'].includes(status) && waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all shadow-emerald-600/20"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Coordinate Pickup on WhatsApp</span>
            </a>
          )}
        </div>
      </div>

      {/* Bottom Action Buttons (State Machine Transitions) */}
      <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
        {role === 'LENDER' && (
          <>
            {status === 'PENDING' && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUpdating}
                  onClick={() => onStatusChange(_id, 'REJECTED')}
                >
                  <X className="w-3.5 h-3.5" />
                  Decline
                </Button>
                <Button
                  variant="campus"
                  size="sm"
                  disabled={isUpdating}
                  onClick={() => onStatusChange(_id, 'APPROVED')}
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve Request
                </Button>
              </>
            )}

            {status === 'APPROVED' && (
              <span className="text-xs text-slate-500 italic">
                Awaiting borrower to collect gear in person.
              </span>
            )}

            {status === 'ACTIVE' && (
              <Button
                variant="campus"
                size="sm"
                disabled={isUpdating}
                onClick={() => onStatusChange(_id, 'RETURNED')}
              >
                <Check className="w-3.5 h-3.5" />
                Confirm Item Returned
              </Button>
            )}

            {status === 'RETURNED' && (
              <Button
                variant="outline"
                size="sm"
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
                onClick={() => onOpenReviewModal(request)}
              >
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                Review Borrower
              </Button>
            )}
          </>
        )}

        {role === 'BORROWER' && (
          <>
            {status === 'PENDING' && (
              <Button
                variant="outline"
                size="sm"
                disabled={isUpdating}
                onClick={() => onStatusChange(_id, 'CANCELLED')}
              >
                Cancel Request
              </Button>
            )}

            {status === 'APPROVED' && (
              <Button
                variant="primary"
                size="sm"
                disabled={isUpdating}
                onClick={() => onStatusChange(_id, 'ACTIVE')}
              >
                <Check className="w-3.5 h-3.5" />
                Confirm Item Received
              </Button>
            )}

            {status === 'ACTIVE' && (
              <span className="text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200/60 font-semibold">
                Active rental • Please return by {new Date(endDate).toLocaleDateString()}
              </span>
            )}

            {status === 'RETURNED' && (
              <Button
                variant="outline"
                size="sm"
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
                onClick={() => onOpenReviewModal(request)}
              >
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                Review Lender
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RequestCard;
