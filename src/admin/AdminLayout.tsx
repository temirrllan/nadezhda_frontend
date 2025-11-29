import { Outlet, Link } from "react-router-dom";
import "./admin.css";

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <h3>Админ</h3>
        <nav>
          <Link to="/">Дашборд</Link>
          <Link to="/costumes">Костюмы</Link>
          <Link to="/bookings">Брони</Link>
          <Link to="/stock">Учёт аренды</Link> {/* 🆕 */}
          <Link to="/logs">Логи</Link>
        </nav>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}