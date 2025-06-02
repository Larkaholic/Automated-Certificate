import Link from "next/link";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-gray-800 text-white h-full">
      <div className="p-4">
        <h2 className="text-lg font-bold">Admin Panel</h2>
      </div>
      <nav className="mt-4">
        <ul>
          <li>
            <Link href="/admin/dashboard" className="block p-2 hover:bg-gray-700">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/admin/certificates" className="block p-2 hover:bg-gray-700">
              Certificates
            </Link>
          </li>
          <li>
            <Link href="/admin/settings" className="block p-2 hover:bg-gray-700">
              Settings
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;