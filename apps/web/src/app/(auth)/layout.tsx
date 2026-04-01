export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden auth-mesh-gradient selection:bg-primary/30">
      {/* Lớp phủ Grid công nghệ (Grid Overlay) */}
      <div className="absolute inset-0 auth-grid-overlay opacity-30" />
      
      {/* Content wrapper */}
      <div className="relative z-10 w-full flex justify-center p-6">
        {children}
      </div>
    </div>
  );
}
