import Sidebar from "../component/sidebar";

export default function Layout({ children }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1  overflow-y-auto h-full">{children}</main>
    </div>
  );
}
