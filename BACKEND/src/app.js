// server.js
const express = require("express");
const helmet = require("helmet");

const app = express();

// Parse JSON and CSP reports sent by the browser.
// WHY: Browsers POST CSP violation reports with content-type application/csp-report.
// We also accept application/json for convenience across browsers.
app.use(express.json({ type: ["application/json", "application/csp-report"] }));

// 1) Baseline security headers (X-Content-Type-Options, Referrer-Policy, etc.)
app.use(helmet());

// 2) Content Security Policy
// WHY: Start with strict defaults. Only our own origin ('self') can provide scripts, styles, images,
// and network requests. This blocks inline/eval scripts and all 3rd-party resources by default.
const cspDirectives = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'"],   // no inline scripts, no eval, no external CDNs
  styleSrc: ["'self'"],    // no inline styles, no external styles
  imgSrc: ["'self'"],      // images must come from our origin
  connectSrc: ["'self'"],  // fetch/XHR/WebSocket to our origin only
  frameAncestors: ["'none'"], // cannot embed this site in iframes (prevents clickjacking)
  upgradeInsecureRequests: [] // if serving over https, upgrade http->https automatically
};

app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,       // keep Helmet’s sane defaults (e.g., base-uri 'self')
    directives: {
      ...cspDirectives,
      // WHY: Tell the browser where to POST violation reports so we can review them during the lab.
      "report-uri": ["/csp-report"],
    },
    // WHY: In dev we want to SEE violations without breaking the app.
    // In production we will enforce (block) instead.
    reportOnly: process.env.NODE_ENV !== "production",
  })
);

// 3) Receive browser violation reports
// WHY: Gives us concrete, inspectable evidence of blocked actions.
app.post("/csp-report", (req, res) => {
  console.log("CSP Violation Report:", JSON.stringify(req.body, null, 2));
  res.sendStatus(204);
});

// Example health route
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`SecureBlog API running at http://localhost:${PORT}`);
  console.log(
    `CSP mode: ${process.env.NODE_ENV !== "production" ? "REPORT-ONLY (dev)" : "ENFORCED (prod)"}`
  );
});