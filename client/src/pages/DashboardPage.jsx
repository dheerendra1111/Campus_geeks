import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import requestService from '../services/requestService';
import itemService from '../services/itemService';
import RequestCard from '../components/requests/RequestCard';
import ReviewModal from '../components/reviews/ReviewModal';
import {
  GraduationCap,
  Star,
  Package,
  Layers,
  Inbox,
  Send,
  PlusCircle,
  AlertCircle,
  Trash2,
  ExternalLink,
  RefreshCw,
  Building,
  IdCard,
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('lender'); // 'lender', 'borrower', 'listings'
  const [lenderRequests, setLenderRequests] = useState([]);
  const [borrowerRequests, setBorrowerRequests] = useState([]);
  const [myListings, setMyListings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [dashboardError, setDashboardError] = useState('');

  // Review Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedRequestForReview, setSelectedRequestForReview] = useState(null);

  // Fetch all dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setDashboardError('');

      const [lenderRes, borrowerRes, listingsRes] = await Promise.all([
        requestService.getLenderRequests(),
        requestService.getBorrowerRequests(),
        itemService.getMyListings(),
      ]);

      if (lenderRes.success) setLenderRequests(lenderRes.data);
      if (borrowerRes.success) setBorrowerRequests(borrowerRes.data);
      if (listingsRes.success) setMyListings(listingsRes.data);
    } catch (err) {
      setDashboardError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handle status transition (Approve, Reject, Active, Returned)
  const handleStatusChange = async (requestId, targetStatus) => {
    try {
      setIsUpdating(true);
      setDashboardError('');
      const res = await requestService.updateRequestStatus(requestId, targetStatus);
      if (res.success) {
        await loadDashboardData();
      }
    } catch (err) {
      setDashboardError(err.message || 'Status update failed.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle item deletion
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    try {
      setIsUpdating(true);
      const res = await itemService.deleteItem(itemId);
      if (res.success) {
        setMyListings((prev) => prev.filter((item) => item._id !== itemId));
      }
    } catch (err) {
      setDashboardError(err.message || 'Failed to delete listing.');
    } finally {
      setIsUpdating(false);
    }
  };

  const openReviewModal = (request) => {
    setSelectedRequestForReview(request);
    setReviewModalOpen(true);
  };

  const pendingLenderCount = lenderRequests.filter((r) => r.status === 'PENDING').length;
  const activeBorrowerCount = borrowerRequests.filter((r) => r.status === 'ACTIVE' || r.status === 'APPROVED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Student Profile Summary Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-brand-500/30">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{user?.name}</h1>
              <span className="bg-brand-500/20 text-brand-300 text-[11px] font-bold px-2 py-0.5 rounded-full border border-brand-500/30">
                Student
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-500" />
                {user?.department}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <IdCard className="w-3.5 h-3.5 text-slate-500" />
                Roll No: {user?.collegeId}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Stats Badges */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 rounded-2xl flex items-center gap-3">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Trust Score</p>
              <p className="text-lg font-black text-white">
                {user?.trustScore ? user.trustScore.toFixed(1) : '5.0'} / 5.0
              </p>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 rounded-2xl flex items-center gap-3">
            <Package className="w-5 h-5 text-brand-400" />
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Total Lends</p>
              <p className="text-lg font-black text-white">{myListings.length}</p>
            </div>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-2.5 rounded-2xl flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Total Borrows</p>
              <p className="text-lg font-black text-white">{borrowerRequests.length}</p>
            </div>
          </div>
        </div>
      </div>

      {dashboardError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span>{dashboardError}</span>
          </div>
          <button
            onClick={() => setDashboardError('')}
            className="text-xs font-bold underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {/* Tab 1: Lender Requests */}
          <button
            type="button"
            onClick={() => setActiveTab('lender')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-extrabold tracking-wide transition-all cursor-pointer ${
              activeTab === 'lender'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Incoming Borrow Requests</span>
            {pendingLenderCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                {pendingLenderCount}
              </span>
            )}
          </button>

          {/* Tab 2: Borrower Requests */}
          <button
            type="button"
            onClick={() => setActiveTab('borrower')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-extrabold tracking-wide transition-all cursor-pointer ${
              activeTab === 'borrower'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>My Borrowed Gear</span>
            {activeBorrowerCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] flex items-center justify-center font-bold">
                {activeBorrowerCount}
              </span>
            )}
          </button>

          {/* Tab 3: My Listed Items */}
          <button
            type="button"
            onClick={() => setActiveTab('listings')}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-extrabold tracking-wide transition-all cursor-pointer ${
              activeTab === 'listings'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>My Listed Items ({myListings.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadDashboardData} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Link to="/list-item">
            <Button variant="campus" size="sm">
              <PlusCircle className="w-3.5 h-3.5" />
              List an Item
            </Button>
          </Link>
        </div>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">Syncing requests from campus peers...</p>
        </div>
      ) : activeTab === 'lender' ? (
        /* Tab 1 Content: Incoming Requests for My Items */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Requests sent by peers for equipment you listed</span>
            <span>{lenderRequests.length} requests total</span>
          </div>

          {lenderRequests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-sm max-w-md mx-auto">
              <Inbox className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-900 text-sm">No incoming borrow requests yet</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                When other students request your listed gear, they will appear here for your approval.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {lenderRequests.map((req) => (
                <RequestCard
                  key={req._id}
                  request={req}
                  role="LENDER"
                  onStatusChange={handleStatusChange}
                  onOpenReviewModal={openReviewModal}
                  isUpdating={isUpdating}
                />
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'borrower' ? (
        /* Tab 2 Content: My Outgoing Borrows */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Equipment you have requested or currently borrowed</span>
            <span>{borrowerRequests.length} requests total</span>
          </div>

          {borrowerRequests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-sm max-w-md mx-auto">
              <Send className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-900 text-sm">No active borrow requests</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Explore the gear catalog to request calculators, drafters, or textbooks.
              </p>
              <Link to="/explore">
                <Button variant="primary" size="sm" className="mt-2">
                  Browse Catalog
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {borrowerRequests.map((req) => (
                <RequestCard
                  key={req._id}
                  request={req}
                  role="BORROWER"
                  onStatusChange={handleStatusChange}
                  onOpenReviewModal={openReviewModal}
                  isUpdating={isUpdating}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Tab 3 Content: My Listed Items */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Manage equipment you have shared with the campus community</span>
            <span>{myListings.length} items listed</span>
          </div>

          {myListings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-sm max-w-md mx-auto">
              <Layers className="w-10 h-10 text-slate-400 mx-auto" />
              <h3 className="font-bold text-slate-900 text-sm">You haven't listed any gear yet</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Turn your idle semester textbooks and lab kits into peer support or extra pocket money.
              </p>
              <Link to="/list-item">
                <Button variant="campus" size="sm" className="mt-2">
                  List Your First Item
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {myListings.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={item.status}>{item.status}</Badge>
                      <span className="text-xs font-bold text-slate-400">{item.category}</span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</h4>

                    <div className="text-xs font-extrabold text-slate-800">
                      {item.pricingType === 'FREE' ? (
                        <span className="text-emerald-600">Free Lending</span>
                      ) : (
                        <span>₹{item.pricePerDay} / day</span>
                      )}
                      {item.depositAmount > 0 && (
                        <span className="text-slate-400 font-normal ml-2">
                          (₹{item.depositAmount} deposit)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      to={`/items/${item._id}`}
                      className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      <span>View</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-rose-600 hover:bg-rose-50 border-rose-200 text-xs px-2.5 py-1"
                      disabled={isUpdating || item.status === 'BORROWED'}
                      onClick={() => handleDeleteItem(item._id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review Modal Dialog */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        request={selectedRequestForReview}
        onReviewSuccess={loadDashboardData}
      />
    </div>
  );
};

export default DashboardPage;
