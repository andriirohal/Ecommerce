export function stockLabel(stock: number) {
  if (stock <= 0) {
    return {
      text: "cart.outOfStock",
      className: "out-of-stock"
    };
  };

  if (stock <= 3) {
    return {
      text: "cart.lowStock",
      className: "low-stock"
    };
  };

  return {
    text: "cart.inStock",
    className: "in-stock"
  };
};