import { Link } from "react-router-dom";

export default function Topbar() {
  return (
    <header
      className="
        sticky top-0 z-50
        bg-white/80
        backdrop-blur-md
        border-b border-[#E6ECEA]
      "
    >
      <div
        className="
          max-w-7xl mx-auto
          px-6 lg:px-10
          h-[72px]
          flex items-center justify-between
        "
      >
        {/* LOGO */}
        <Link to="/" className="flex items-center">
          <img
            src="/image/logo.png"
            alt="Graphura"
            className="
              h-10 w-auto
              object-contain
              transition-transform duration-300
              hover:scale-[1.03]
            "
          />
        </Link>

        {/* ACTIONS */}
        <nav className="flex items-center gap-5">
          {/* SIGN IN */}
          <Link
            to="/login"
            className="
              text-[15px]
              font-medium
              text-[#235857]
              transition-colors duration-200
              hover:text-[#163F3B]
            "
          >
            Sign in
          </Link>

          {/* PRIMARY CTA */}
          <Link
            to="/signup"
            className="
              px-6 py-2.5
              rounded-xl
              bg-[#235857]
              text-white
              text-sm font-semibold
              transition-all duration-300

              hover:bg-[#1B4D49]
              hover:-translate-y-[1px]
              hover:shadow-lg

              active:translate-y-0
            "
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}
