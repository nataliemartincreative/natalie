import { SiteHeader } from "@/components/site-header";
import { Container } from "@/components/ui";
import { site } from "@/content/site";
import { signOut } from "../enter/actions";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader name={site.name} social={site.contact} />
      <main>{children}</main>
      <footer className="mt-32 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-6 border-t border-rule pt-8 text-sm text-mute">
            <div>
              {site.contact.length > 0 && (
                <>
                  <p className="font-medium text-ink">Project inquiries</p>
                  <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                    {site.contact.map((c) => (
                      <li key={c.href}>
                        <a
                          href={c.href}
                          target={c.href.startsWith("http") ? "_blank" : undefined}
                          rel="noreferrer"
                          className="underline underline-offset-4 hover:text-accent"
                        >
                          {c.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <p className={site.contact.length > 0 ? "mt-6" : ""}>
                © {new Date().getFullYear()} {site.name}
              </p>
            </div>
            <form action={signOut}>
              <button type="submit" className="min-h-11 hover:text-accent">
                Sign out
              </button>
            </form>
          </div>
        </Container>
      </footer>
    </>
  );
}
