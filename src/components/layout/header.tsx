import Link from "next/link";

const Header = () => {
  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <h1 className="text-xl font-bold">Admin Portal</h1>
      <nav>
        <ul className="flex space-x-4">
          <li>
            <Link href="/admin/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link href="/admin/certificates">Certificates</Link>
          </li>
          <li>
            <Link href="/login">Logout</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;