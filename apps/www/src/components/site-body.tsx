export default function SiteBody({
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div {...props}>
      <div className="mx-auto max-lg:max-w-2xl max-lg:border-x max-sm:border-x-0 border-separator">
        {children}
      </div>
    </div>
  );
}
