function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-slate-400 md:flex-row">
        <p>© {new Date().getFullYear()} NovaSwap. All rights reserved.</p>

        <div className="flex items-center gap-6">
          <a
            href="#"
            className="transition-colors duration-200 hover:text-cyan-400"
          >
            Privacy
          </a>

          <a
            href="#"
            className="transition-colors duration-200 hover:text-cyan-400"
          >
            Terms
          </a>

          <a
            href="#"
            className="transition-colors duration-200 hover:text-cyan-400"
          >
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;