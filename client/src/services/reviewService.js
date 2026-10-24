import api from './api';

export const reviewService = {
  // Submit a peer review for a completed transaction
  createReview: async ({ requestId, rating, comment }) => {
    const { data } = await api.post('/reviews', {
      requestId,
      rating,
      comment,
    });
    return data;
  },

  // Get all reviews received by a user
  getUserReviews: async (userId) => {
    const { data } = await api.get(`/reviews/user/${userId}`);
    return data;
  },
};

export default reviewService;
