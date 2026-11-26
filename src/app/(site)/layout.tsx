import { SiteHeader } from "@/components/site-header";
import { site } from "@/content/site";
import { signOut } from "../enter/actions";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader name={site.name} role={site.role} />
      <main>{children}</main>
      <footer className="label mt-32 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-ink px-4 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-ink-soft sm:px-6">
        <span>
          © {new Date().getFullYear()} {site.name}
        </span>
        <span className="flex items-center gap-6">
          {site.contact.map((c) => (
            <a key={c.href} href={c.href} className="hover:text-ink" target={c.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
              {c.label}
            </a>
          ))}
          <form action={signOut}>
            <button type="submit" className="uppercase hover:text-ink">
              Sign out
            </button>
          </form>
        </span>
      </footer>
    </>
  );
}
