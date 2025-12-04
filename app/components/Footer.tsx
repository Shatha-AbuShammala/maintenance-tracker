import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-white mt-auto">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="text-xl font-semibold">Contact Us</h3>
            <p className="mt-4 text-sm text-slate-300">Have questions or need assistance? Reach out anytime.</p>
            <p className="mt-2 text-sm text-slate-400">Email: support@cityops.com</p>
            <p className="text-sm text-slate-400">Phone: +1 (123) 456-7890</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>
                <Link href="/about" className="hover:text-white cursor-pointer">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-white cursor-pointer">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white cursor-pointer">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold">Follow Us</h3>
            <div className="mt-4 flex space-x-4 text-lg text-slate-300">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white cursor-pointer">
                Facebook
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white cursor-pointer">
                Twitter
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white cursor-pointer">
                LinkedIn
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold">Newsletter</h3>
            <p className="mt-4 text-sm text-slate-300">Stay updated with the latest news and updates.</p>
            <div className="mt-4 space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <button className="w-full rounded-lg bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-400/20 transition hover:-translate-y-0.5 hover:shadow-xl cursor-pointer">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-slate-400">
          <p>&copy; {currentYear} City Ops. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
