import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Admin — Gigva Kenya',
  robots: { index: false, follow: false },
}

// Server component — just redirect to login.
// The dashboard itself handles the auth check client-side.
export default function AdminRootPage() {
  redirect('/admin/login')
}
