export const isTokenExpired = (expiryDate: any) => {
  if (!expiryDate) return false;
  const expiry = expiryDate;
  return expiry < new Date();
};
