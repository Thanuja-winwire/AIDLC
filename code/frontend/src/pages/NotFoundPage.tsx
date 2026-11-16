import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center" data-testid="not-found">
      <p className="text-5xl font-semibold text-brand-600">404</p>
      <h1>Page not found</h1>
      <p className="text-slate-500">The page you are looking for does not exist.</p>
      <Link to="/" className="btn-primary mt-2">Go home</Link>
    </div>
  );
}
