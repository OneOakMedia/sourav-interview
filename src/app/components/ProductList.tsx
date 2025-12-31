"use client";
import { useEffect, useState } from "react";
type Product = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  // TODO (Candidate):
  // Implement order flow:
  // - Call POST /api/order
  // - Handle success / failure
  // - Update UI accordingly
  async function placeOrder(productId: string, qty: number) {}

  return (
    <div>
      <h2 className="text-center text-xl mb-10">Products</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr className="text-left border-b">
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Order</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id} className="py-4">
              <td>{p.name}</td>
              <td>${p.price.toFixed(2)}</td>
              <td>{p.stock}</td>
              <td>
                <OrderControls product={p} onOrder={placeOrder} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderControls({
  product,
  onOrder,
}: {
  product: Product;
  onOrder: (id: string, qty: number) => void;
}) {
  const [qty, setQty] = useState(1);

  return (
    <div>
      <input
        type="number"
        value={qty}
        min={1}
        max={product.stock || 1}
        onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
        style={{ width: 60 }}
      />
      <button
        onClick={() => onOrder(product._id, qty)}
        disabled={product.stock <= 0}
        style={{ marginLeft: 8 }}
        className="border cursor-pointer p-1"
      >
        Order
      </button>
    </div>
  );
}
