// app/page.tsx
// Server component page that renders ProductList client component.
// Candidate does not need to modify this file in most cases.

import ProductList from "./components/ProductList";


export default function Page() {
  return (
    <main style={{ padding: 20 }}>
      <h1>Inventory Ordering Service (Boilerplate)</h1>
      <p>Use the UI below to view products and place orders.</p>
      <ProductList />
    </main>
  );
}
