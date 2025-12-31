// app/components/ProductList.tsx
"use client";

/*
Client component to fetch products and render them.
Candidate tasks:
 - Implement client-side fetch of GET /api/products
 - Display products and show current stock
 - Integrate OrderForm to place an order
 - Handle success/failure and update UI accordingly (optimistic update optional)
*/

import React, { useEffect, useState } from "react";

type Product = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  async function placeOrder(productId: string, qty: number) {
    // Candidate TODO:
    // - Call POST /api/order with JSON { productId, quantity: qty }
    // - On success: update local UI to reflect new stock (either refetch products or update locally)
    // - On failure: show appropriate message
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: qty }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert("Order failed: " + (data?.error || "unknown"));
        return;
      }
      // simple approach: refetch full list
      await fetchProducts();
      alert("Order placed successfully");
    } catch (err: any) {
      alert("Order error: " + String(err));
    }
  }

  if (loading && !products) return <div>Loading products...</div>;
  if (error) return <div>Error loading products: {error}</div>;
  if (!products) return <div>No products</div>;

  return (
    <div>
      <h2>Products</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr><th>Name</th><th>Price</th><th>Stock</th><th>Order</th></tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
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

function OrderControls({ product, onOrder }: { product: Product; onOrder: (id: string, qty: number) => void }) {
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
      >
        Order
      </button>
    </div>
  );
}
