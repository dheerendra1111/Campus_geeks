import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import itemService from '../services/itemService';
import ItemCard from '../components/items/ItemCard';
import CategoryFilter from '../components/items/CategoryFilter';
import { Search, X, SlidersHorizontal, PackageSearch, PlusCircle, Sparkles } from 'lucide-react';
import Button from '../components/common/Button';

export const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  // Filters state from URL query params
  const categoryParam = searchParams.get('category') || 'All';
  const searchParam = searchParams.get('search') || '';
  const conditionParam = searchParams.get('condition') || '';
  const pricingTypeParam = searchParams.get('pricingType') || '';
  const sortParam = searchParams.get('sort') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [searchInput, setSearchInput] = useState(searchParam);

  // Sync search input when URL changes
  useEffect(() => {
    setSearchInput(searchParam);
  }, [searchParam]);

  // Fetch items whenever query params change
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page: pageParam,
          limit: 12,
        };

        if (categoryParam && categoryParam !== 'All') params.category = categoryParam;
        if (searchParam) params.search = searchParam;
        if (conditionParam) params.condition = conditionParam;
        if (pricingTypeParam) params.pricingType = pricingTypeParam;
        if (sortParam) params.sort = sortParam;

        const res = await itemService.getItems(params);
        if (res.success) {
          setItems(res.data);
          setTotalCount(res.total);
        }
      } catch (err) {
        setError(err.message || 'Failed to load gear catalog');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [categoryParam, searchParam, conditionParam, pricingTypeParam, sortParam, pageParam]);

  // Update query params helper
  const updateQuery = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '' || value === 'All') {
        updated.delete(key);
      } else {
        updated.set(key, value);
      }
    });
    // Reset to page 1 on filter changes
    if (!newParams.page) {
      updated.delete('page');
    }
    setSearchParams(updated);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateQuery({ search: searchInput });
  };

  const clearSearch = () => {
    setSearchInput('');
    updateQuery({ search: '' });
  };

  const resetAllFilters = () => {
    setSearchInput('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Explore Campus Gear
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Find textbooks, lab kits, and tools available for borrowing right now on your campus.
            </p>
          </div>

          <Link to="/list-item">
            <Button variant="campus" size="md" className="w-full sm:w-auto">
              <PlusCircle className="w-4 h-4" />
              List an Item
            </Button>
          </Link>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title (e.g. Arduino, Drafter, Casio fx-991, Lab Coat)..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-sm"
            />
            {searchInput && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Pricing Filter Pill Toggle */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm text-xs font-semibold">
            <button
              onClick={() => updateQuery({ pricingType: '' })}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                !pricingTypeParam
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Rates
            </button>
            <button
              onClick={() => updateQuery({ pricingType: 'FREE' })}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                pricingTypeParam === 'FREE'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Free Only
            </button>
            <button
              onClick={() => updateQuery({ pricingType: 'RENT_PER_DAY' })}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                pricingTypeParam === 'RENT_PER_DAY'
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rent per Day
            </button>
          </div>

          {/* Condition Dropdown */}
          <select
            value={conditionParam}
            onChange={(e) => updateQuery({ condition: e.target.value })}
            className="px-3.5 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500/20 shadow-sm"
          >
            <option value="">Any Condition</option>
            <option value="Brand New">Brand New</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
          </select>
        </div>

        {/* Category Pills */}
        <div className="pt-2">
          <CategoryFilter
            selectedCategory={categoryParam}
            onSelectCategory={(cat) => updateQuery({ category: cat })}
          />
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-semibold border-b border-slate-100 pb-3">
        <span>
          Showing {items.length} of {totalCount} items
          {categoryParam !== 'All' && ` in ${categoryParam}`}
          {searchParam && ` for "${searchParam}"`}
        </span>

        {(searchParam || categoryParam !== 'All' || conditionParam || pricingTypeParam) && (
          <button
            onClick={resetAllFilters}
            className="text-brand-600 hover:text-brand-700 underline underline-offset-2 cursor-pointer"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-4 border border-slate-200/80 space-y-4 animate-pulse shadow-sm"
            >
              <div className="aspect-[4/3] bg-slate-200 rounded-2xl" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-rose-50 rounded-3xl border border-rose-200 text-rose-700 space-y-3">
          <p className="font-semibold">{error}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <PackageSearch className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No items found</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              No equipment currently matches your search or filter. Try clearing filters or be the
              first to list one!
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" onClick={resetAllFilters}>
              Clear Filters
            </Button>
            <Link to="/list-item">
              <Button variant="primary" size="sm">
                List an Item
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <ItemCard key={item._id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
