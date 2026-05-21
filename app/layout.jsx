export const metadata = {
  title: "Intent-to-Command Mission Demo",
  description: "Operator-supervised EO intent-to-command mission orchestration demo"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/styles.css?v=llm-target-dispatch-20260521" />
        <link rel="stylesheet" href="/mission-console-polish.css?v=llm-target-dispatch-20260521" />
      </head>
      <body>{children}</body>
    </html>
  );
}
