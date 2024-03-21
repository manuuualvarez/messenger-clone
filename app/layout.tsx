import './globals.css'

export const metadata = {
  title: 'Messenger CLone',
  description: 'Its a tutorial example',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
