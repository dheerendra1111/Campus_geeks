import api from './api';

export const requestService = {
  // Submit a new borrow request
  createRequest: async (requestData) => {
    const { data } = await api.post('/requests', requestData);
    return data;
  },

  // Get all borrow requests made by the current user (Outgoing borrows)
  getBorrowerRequests: async () => {
    const { data } = await api.get('/requests/borrower');
    return data;
  },

  // Get all incoming requests for equipment listed by the current user
  getLenderRequests: async () => {
    const { data } = await api.get('/requests/lender');
    return data;
  },

  // Inspect a specific request
  getRequestById: async (id) => {
    const { data } = await api.get(`/requests/${id}`);
    return data;
  },

  // Update status (State Machine transition: APPROVED, ACTIVE, RETURNED, REJECTED, CANCELLED)
  updateRequestStatus: async (id, status, lenderNotes = '') => {
    const { data } = await api.patch(`/requests/${id}/status`, {
      status,
      lenderNotes,
    });
    return data;
  },
};

export default requestService;
