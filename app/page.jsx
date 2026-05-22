import Script from "next/script";
import fs from "node:fs";
import path from "node:path";

export default function Page() {
  const html = fs.readFileSync(path.join(process.cwd(), "app", "static-shell.html"), "utf8");

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <Script src="/script.js?v=aligned-aoi-map-20260522" strategy="afterInteractive" />
      <Script src="/construction-target-hotfix.js" strategy="afterInteractive" />
    </>
  );
}
