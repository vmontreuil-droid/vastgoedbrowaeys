// Standalone layout voor pand-microsites — geen SiteHeader/SiteFooter,
// pand staat centraal. Eigen minimale chrome wordt in page.tsx getoond.
export default function PandLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
