import Provider from "./providers/Providers";
import ToastProvider from "./components/ToastProvider";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
  title: "Maintenance Tracker",
  description: "Track and manage city issues",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Provider>
          {children}
          <ToastProvider />
        </Provider>
      </body>
    </html>
  );
}
