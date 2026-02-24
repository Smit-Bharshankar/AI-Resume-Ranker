export const successResponse = (data) => ({
  success: true,
  data,
});

export const errorResponse = (message) => ({
  success: false,
  error: message,
});
