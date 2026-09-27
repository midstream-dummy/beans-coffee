const http = require("http");

const PORT = process.env.PORT || 3000;

const PRODUCTS = [
  { id: "espresso", name: "Espresso Beans", origin: "Guatemala", price: 1800 },
  { id: "filter", name: "Filter Roast", origin: "Ethiopia", price: 1500 },
  { id: "decaf", name: "Decaf Blend", origin: "Colombia", price: 1400 },
];

const money = (c) => `£${(c / 100).toFixed(2)}`;

function readCart(req) {
  const raw = (req.headers.cookie || "")
    .split("; ")
    .find((p) => p.startsWith("cart="));
  if (!raw) return [];
  try {
    return JSON.parse(decodeURIComponent(raw.slice("cart=".length)));
  } catch {
    return [];
  }
}

const CSS = `
  * { box-sizing: border-box; }
  body { margin:0; font: 16px/1.5 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
         color:#18181b; background:#fafaf9; }
  header { border-bottom:1px solid #e7e5e4; background:#fff; }
  .bar { max-width:880px; margin:0 auto; padding:18px 24px; display:flex;
         align-items:center; justify-content:space-between; }
  .brand { font-weight:600; letter-spacing:-0.2px; text-decoration:none; color:#18181b; }
  main { max-width:880px; margin:0 auto; padding:40px 24px 64px; }
  h1 { font-size:30px; letter-spacing:-0.6px; margin:0 0 6px; }
  .sub { color:#78716c; margin:0 0 32px; }
  .grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
  .card { background:#fff; border:1px solid #e7e5e4; border-radius:10px; padding:20px; }
  .card h2 { font-size:17px; margin:0 0 2px; }
  .origin { color:#78716c; font-size:14px; margin:0 0 16px; }
  .price { font-variant-numeric:tabular-nums; font-weight:600; margin:0 0 16px; }
  button, .btn { font:inherit; border-radius:7px; padding:9px 14px; cursor:pointer;
                 border:1px solid #18181b; background:#18181b; color:#fff; text-decoration:none;
                 display:inline-block; }
  .btn.ghost { background:#fff; color:#18181b; border-color:#d6d3d1; }
  table { width:100%; border-collapse:collapse; background:#fff;
          border:1px solid #e7e5e4; border-radius:10px; overflow:hidden; }
  th, td { text-align:left; padding:14px 18px; border-bottom:1px solid #f5f5f4; }
  th { font-size:13px; text-transform:uppercase; letter-spacing:0.4px; color:#78716c; }
  td.num, th.num { text-align:right; font-variant-numeric:tabular-nums; }
  tr:last-child td { border-bottom:0; }
  .total td { font-weight:600; background:#fafaf9; }
  .empty { color:#78716c; }
  .row { display:flex; gap:10px; margin-top:24px; }
  .pill { background:#18181b; color:#fff; border-radius:999px; padding:2px 9px;
          font-size:13px; font-variant-numeric:tabular-nums; }
`;

function page(title, body, cartCount) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<title>${title} · Beans</title><style>${CSS}</style></head><body>
<header><div class="bar">
  <a class="brand" href="/">Beans<span style="color:#a8a29e">.</span>Coffee</a>
  <a class="btn ghost" href="/cart">Cart <span class="pill">${cartCount}</span></a>
</div></header><main>${body}</main></body></html>`;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const cart = readCart(req);
  const count = cart.reduce((n, i) => n + i.qty, 0);

  if (url.pathname === "/" && req.method === "GET") {
    const cards = PRODUCTS.map(
      (p) => `<div class="card">
        <h2>${p.name}</h2>
        <p class="origin">${p.origin}</p>
        <p class="price">${money(p.price)}</p>
        <form method="POST" action="/cart/add">
          <input type="hidden" name="id" value="${p.id}">
          <button type="submit">Add to cart</button>
        </form>
      </div>`,
    ).join("");
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(
      page(
        "Shop",
        `<h1>Fresh beans, roasted weekly</h1>
         <p class="sub">Three roasts. Free delivery over £30.</p>
         <div class="grid">${cards}</div>`,
        count,
      ),
    );
    return;
  }

  if (url.pathname === "/cart/add" && req.method === "POST") {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const id = new URLSearchParams(body).get("id");
      const next = [...cart];
      const line = next.find((i) => i.id === id);
      if (line) line.qty += 1;
      else if (PRODUCTS.some((p) => p.id === id)) next.push({ id, qty: 1 });
      res.writeHead(303, {
        Location: "/cart",
        "Set-Cookie": `cart=${encodeURIComponent(JSON.stringify(next))}; Path=/; Max-Age=86400`,
      });
      res.end();
    });
    return;
  }

  if (url.pathname === "/cart" && req.method === "GET") {
    if (cart.length === 0) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(
        page(
          "Cart",
          `<h1>Your cart</h1><p class="empty">Nothing here yet.</p>
           <div class="row"><a class="btn" href="/">Browse the shop</a></div>`,
          0,
        ),
      );
      return;
    }
    let total = 0;
    const rows = cart
      .map((line) => {
        const p = PRODUCTS.find((x) => x.id === line.id);
        const sum = p.price * line.qty;
        total += sum;
        return `<tr><td>${p.name}</td><td class="num">${line.qty}</td>
                <td class="num">${money(sum)}</td></tr>`;
      })
      .join("");
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(
      page(
        "Cart",
        `<h1>Your cart</h1><p class="sub">Delivery is free on this order.</p>
         <table><thead><tr><th>Item</th><th class="num">Qty</th>
         <th class="num">Total</th></tr></thead><tbody>${rows}
         <tr class="total"><td>Order total</td><td class="num">${count}</td>
         <td class="num">${money(total)}</td></tr></tbody></table>
         <div class="row"><button>Checkout</button>
         <a class="btn ghost" href="/">Keep shopping</a></div>`,
        count,
      ),
    );
    return;
  }

  res.writeHead(404, { "Content-Type": "text/html" });
  res.end(page("Not found", "<h1>Not found</h1>", count));
});

server.listen(PORT, () => console.log(`Beans shop listening on ${PORT}`));
