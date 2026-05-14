export const metadata = {
  title: "Mission Abstraction Layer Demo",
  description: "Operator-supervised EO mission orchestration demo"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
