export default function Resource({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-secondary rounded p-4 my-4 [&_hr]:my-4 [&>h2]:first:mt-0 [&>h3]:first:mt-0">
      {children}
    </div>
  );
}
