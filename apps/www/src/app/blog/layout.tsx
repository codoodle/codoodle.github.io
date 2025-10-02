import Nav from "@/components/nav";
import NavDialog from "@/components/nav-dialog";
import NavItem from "@/components/nav-item";
import { blog } from "@/content";

const categories = blog.categories
  .filter((category) => !category.categories)
  .sort((a, b) => a.name.localeCompare(b.name));

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="lg:grid grid-cols-[minmax(0,17rem)_2rem_var(--container-2xl)_1fr]">
      <Nav className="uppercase p-3 py-4 flex items-center gap-3 sticky top-0 bg-background border-b border-separator lg:col-[1/5] z-20">
        <NavItem
          href="/blog"
          exact
          className="data-[active]:font-normal font-[family-name:var(--font-major-mono-display)]"
        >
          Blog
        </NavItem>
        {categories.length > 0 && (
          <>
            <div
              role="none"
              className="hidden bg-border h-4 w-px sm:block"
            ></div>
            <NavDialog triggerProps={{ className: "ml-auto sm:hidden" }}>
              <Nav className="uppercase flex flex-col gap-3">
                {categories
                  .filter((category) => !category.categories)
                  .map((category) => (
                    <NavItem
                      key={category.slug}
                      href={`/blog/${category.slug}`}
                      className="text-sm"
                    >
                      {category.name}
                    </NavItem>
                  ))}
              </Nav>
            </NavDialog>
            {categories
              .filter((category) => !category.categories)
              .map((category) => (
                <NavItem
                  key={category.slug}
                  href={`/blog/${category.slug}`}
                  className="text-sm hidden sm:inline-block"
                >
                  {category.name}
                </NavItem>
              ))}
          </>
        )}
      </Nav>
      {children}
    </div>
  );
}
