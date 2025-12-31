import ProductList from "./components/ProductList";

export default function Page() {
  return (
    <main style={{ padding: 20 }}>
      <h1 className="text-center text-xl mb-10">Inventory Ordering System</h1>
      <ProductList />
    </main>
  );
}
