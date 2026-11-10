import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, Package, Search, ShoppingBag, ShoppingCart, User, Users, X, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const submit = (e) => {
    e.preventDefault();
    navigate(q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : '/products');
    setOpen(false);
  };
  const link = 'rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-primary-600"><ShoppingBag className="h-6 w-6" /> Shopwave</Link>
        <form onSubmit={submit} className="relative hidden flex-1 md:block md:max-w-md" role="search">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input aria-label="Search products" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="input pl-9" />
        </form>
        <nav className="ml-auto hidden items-center gap-1 md:flex">
          <NavLink to="/products" className={link}>Shop</NavLink>
          {user && <NavLink to="/orders" className={link}>Orders</NavLink>}
          {isAdmin && <NavLink to="/admin" className={link}>Admin</NavLink>}
          {user && (
            <Link to="/cart" className="relative rounded-md p-2 text-slate-600 hover:bg-slate-100" aria-label={`Cart, ${count} items`}>
              <ShoppingCart className="h-5 w-5" />
              {count > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1 text-xs text-white">{count}</span>}
            </Link>
          )}
          {user ? (
            <>
              <NavLink to="/profile" className={link}><User className="mr-1 inline h-4 w-4" />{user.name}</NavLink>
              <button onClick={() => { logout(); navigate('/'); }} className={link} aria-label="Log out"><LogOut className="h-4 w-4" /></button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={link}>Log in</NavLink>
              <Link to="/register" className="rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700">Sign up</Link>
            </>
          )}
        </nav>
        <button className="ml-auto rounded-md p-2 hover:bg-slate-100 md:hidden" aria-label="Toggle menu" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="space-y-1 border-t border-slate-200 px-4 py-3 md:hidden" onClick={() => setOpen(false)}>
          <form onSubmit={submit} className="mb-2" onClick={(e) => e.stopPropagation()}>
            <input aria-label="Search products" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="input" />
          </form>
          <Link to="/products" className={`${link} block`}>Shop</Link>
          {user && <Link to="/cart" className={`${link} block`}>Cart ({count})</Link>}
          {user && <Link to="/orders" className={`${link} block`}>Orders</Link>}
          {user && <Link to="/profile" className={`${link} block`}>Profile</Link>}
          {isAdmin && <Link to="/admin" className={`${link} block`}>Admin</Link>}
          {user ? <button onClick={() => { logout(); navigate('/'); }} className={`${link} block w-full text-left`}>Log out</button> : (
            <>
              <Link to="/login" className={`${link} block`}>Log in</Link>
              <Link to="/register" className={`${link} block`}>Sign up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return <footer className="mt-16 border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">© {new Date().getFullYear()} Shopwave. Demo store — payments are simulated.</footer>;
}

export function ShopLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8"><Outlet /></main>
      <Footer />
    </div>
  );
}

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const item = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100'}`;
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 md:flex-row">
        <button className="btn md:hidden rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm" onClick={() => setOpen(!open)} aria-expanded={open}>
          <Menu className="mr-2 inline h-4 w-4" /> Admin menu
        </button>
        <aside className={`${open ? 'block' : 'hidden'} card h-fit w-full space-y-1 p-3 md:block md:w-56`} onClick={() => setOpen(false)}>
          <NavLink to="/admin" end className={item}><LayoutDashboard className="h-4 w-4" /> Dashboard</NavLink>
          <NavLink to="/admin/products" className={item}><Package className="h-4 w-4" /> Products</NavLink>
          <NavLink to="/admin/orders" className={item}><ClipboardList className="h-4 w-4" /> Orders</NavLink>
          <NavLink to="/admin/users" className={item}><Users className="h-4 w-4" /> Users</NavLink>
        </aside>
        <section className="min-w-0 flex-1"><Outlet /></section>
      </div>
    </div>
  );
}
