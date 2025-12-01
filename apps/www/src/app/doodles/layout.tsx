import Nav from "@/components/nav";
import NavItem from "@/components/nav-item";

export const metadata = {
  title: "Doodles",
  description: "A place for small code snippets and experiments",
};

export default function DoodlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Nav className="uppercase p-3 py-4 flex items-center gap-3 sticky top-0 bg-background border-b border-separator z-20">
        <NavItem
          href="/doodles"
          className="data-[active]:font-normal font-[family-name:var(--font-major-mono-display)]"
        >
          Doodles
        </NavItem>
      </Nav>
      {children}
    </div>
  );
}
