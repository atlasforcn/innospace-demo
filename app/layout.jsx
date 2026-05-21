export const metadata = {
  title: "Intent-to-Command Mission Demo",
  description: "Operator-supervised EO intent-to-command mission orchestration demo"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/styles.css" />
        <link rel="stylesheet" href="/mission-console-polish.css?v=map-nav-20260521" />
      </head>
      <body>{children}</body>
    </html>
  );
}
