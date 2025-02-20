export const formatPrice = (price: number) =>
  Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(price);
