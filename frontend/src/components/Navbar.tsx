interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
 // { label: "Teacher Access", href: "#" },
  { label: "Rate Search", href: "#" },
  { label: "Rate Management", href: "#" },
  { label: "Quoting", href: "#" },
];

const Navbar: React.FC = () => {
  const active = "Rate Scores"; // you can make this dynamic later

  return (
    <nav className="bg-gray-300 border-b border-gray-100 shadow-sm ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          {/* Left side - Navigation Tabs */}
          <div className="flex space-x-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`relative pb-1 font-medium transition-colors ${
                  item.label === active
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right side - User Menu */}
          <div className="flex items-center space-x-3">
            <span className="text-gray-700 font-semibold">Admin</span>
            <button className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition">
              A
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;