import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Boxes, ClipboardList, PackagePlus, RefreshCcw, ShoppingCart, UserPlus } from "lucide-react";
import "./styles.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || "Request failed");
  }

  if (response.status === 204) return null;
  return response.json();
}

function App() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [productForm, setProductForm] = useState({ name: "", sku: "", description: "", price: "", stock_quantity: "" });
  const [customerForm, setCustomerForm] = useState({ name: "", email: "", phone: "" });
  const [orderForm, setOrderForm] = useState({ customer_id: "", product_id: "", quantity: 1 });

  const stats = useMemo(() => {
    const stock = products.reduce((sum, product) => sum + Number(product.stock_quantity), 0);
    const revenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    return { stock, revenue };
  }, [products, orders]);

  async function loadData() {
    setLoading(true);
    try {
      const [nextProducts, nextCustomers, nextOrders] = await Promise.all([
        api("/products"),
        api("/customers"),
        api("/orders"),
      ]);
      setProducts(nextProducts);
      setCustomers(nextCustomers);
      setOrders(nextOrders);
      setMessage("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function submitProduct(event) {
    event.preventDefault();
    try {
      await api("/products", {
        method: "POST",
        body: JSON.stringify({ ...productForm, price: Number(productForm.price), stock_quantity: Number(productForm.stock_quantity) }),
      });
      setProductForm({ name: "", sku: "", description: "", price: "", stock_quantity: "" });
      setMessage("Product added.");
      loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function submitCustomer(event) {
    event.preventDefault();
    try {
      await api("/customers", { method: "POST", body: JSON.stringify(customerForm) });
      setCustomerForm({ name: "", email: "", phone: "" });
      setMessage("Customer added.");
      loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function submitOrder(event) {
    event.preventDefault();
    try {
      await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          customer_id: Number(orderForm.customer_id),
          items: [{ product_id: Number(orderForm.product_id), quantity: Number(orderForm.quantity) }],
        }),
      });
      setOrderForm({ customer_id: "", product_id: "", quantity: 1 });
      setMessage("Order placed and inventory updated.");
      loadData();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Inventory operations</p>
          <h1>Inventory & Order Management</h1>
        </div>
        <button className="icon-button" onClick={loadData} aria-label="Refresh data" title="Refresh data">
          <RefreshCcw size={18} />
        </button>
      </header>

      <section className="metrics" aria-label="System summary">
        <Metric icon={<Boxes size={20} />} label="Products" value={products.length} />
        <Metric icon={<UserPlus size={20} />} label="Customers" value={customers.length} />
        <Metric icon={<ShoppingCart size={20} />} label="Orders" value={orders.length} />
        <Metric icon={<ClipboardList size={20} />} label="Revenue" value={`$${stats.revenue.toFixed(2)}`} />
      </section>

      {message && <div className="notice">{message}</div>}
      {loading && <div className="notice subtle">Refreshing data...</div>}

      <section className="workgrid">
        <form className="panel" onSubmit={submitProduct}>
          <PanelTitle icon={<PackagePlus size={18} />} title="Add Product" />
          <input required placeholder="Name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
          <input required placeholder="SKU" value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} />
          <input placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
          <div className="split">
            <input required min="0" step="0.01" type="number" placeholder="Price" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
            <input required min="0" type="number" placeholder="Stock" value={productForm.stock_quantity} onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })} />
          </div>
          <button type="submit">Save Product</button>
        </form>

        <form className="panel" onSubmit={submitCustomer}>
          <PanelTitle icon={<UserPlus size={18} />} title="Add Customer" />
          <input required placeholder="Name" value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} />
          <input required type="email" placeholder="Email" value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} />
          <input placeholder="Phone" value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} />
          <button type="submit">Save Customer</button>
        </form>

        <form className="panel" onSubmit={submitOrder}>
          <PanelTitle icon={<ShoppingCart size={18} />} title="Create Order" />
          <select required value={orderForm.customer_id} onChange={(e) => setOrderForm({ ...orderForm, customer_id: e.target.value })}>
            <option value="">Select customer</option>
            {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}</option>)}
          </select>
          <select required value={orderForm.product_id} onChange={(e) => setOrderForm({ ...orderForm, product_id: e.target.value })}>
            <option value="">Select product</option>
            {products.map((product) => <option key={product.id} value={product.id}>{product.name} ({product.stock_quantity})</option>)}
          </select>
          <input required min="1" type="number" placeholder="Quantity" value={orderForm.quantity} onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })} />
          <button type="submit">Place Order</button>
        </form>
      </section>

      <section className="tables">
        <DataTable title="Products" columns={["SKU", "Name", "Price", "Stock"]} rows={products.map((p) => [p.sku, p.name, `$${Number(p.price).toFixed(2)}`, p.stock_quantity])} />
        <DataTable title="Recent Orders" columns={["Customer", "Items", "Total"]} rows={orders.map((o) => [o.customer.name, o.items.map((item) => `${item.product.name} x${item.quantity}`).join(", "), `$${Number(o.total_amount).toFixed(2)}`])} />
      </section>
    </main>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div className="metric">
      <span>{icon}</span>
      <div>
        <strong>{value}</strong>
        <p>{label}</p>
      </div>
    </div>
  );
}

function PanelTitle({ icon, title }) {
  return <h2>{icon}{title}</h2>;
}

function DataTable({ title, columns, rows }) {
  return (
    <div className="table-panel">
      <h2>{title}</h2>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((row, index) => (
              <tr key={`${title}-${index}`}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>
            )) : (
              <tr><td colSpan={columns.length}>No records yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
