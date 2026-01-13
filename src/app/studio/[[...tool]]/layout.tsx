export const metadata = {
  title: 'AfriVerse Studio',
  description: 'Content Management Studio for AfriVerse',
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div 
      style={{ 
        height: '100vh', 
        width: '100vw',
      }}
    >
      {children}
    </div>
  );
}
