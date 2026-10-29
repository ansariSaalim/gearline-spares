# Gearline Spares

A demo web app for a car and bike spare-parts seller. Customers browse parts by vehicle or part number and order on WhatsApp. The seller manages parts, stock and orders from an admin view and sends UPI payment requests on WhatsApp.

It is a static site (HTML, CSS and plain JavaScript) with no backend, so it runs on GitHub Pages as is.

## Views

| View | URL | What it does |
|---|---|---|
| Shop | `#shop` | Parts catalogue, vehicle and category filters, search, product details, cart, checkout |
| Product | `#p-<id>` | Opens one part directly. This is the link sent in WhatsApp messages and the Share button |
| Admin | `#admin` | Seller console. Demo PIN: **1234** |

## How the WhatsApp flow works

1. **Buy one part**: *Buy on WhatsApp* opens a chat with the seller containing the part name, brand, part number, fitment, quantity, total and a link back to the part.
2. **Cart checkout**: the customer enters name, WhatsApp number and address and picks *Pay on WhatsApp* or *Cash on delivery*. *Place order on WhatsApp* saves the order, reduces stock and opens WhatsApp with the full order (items, part numbers, links, totals, address).
3. **Payment**: in Admin → Orders, *Request payment* opens WhatsApp to the customer with the amount and the shop's UPI ID. The seller marks the order Paid, Shipped and Delivered as it moves along.

All WhatsApp links use `https://wa.me/<number>?text=<message>`, which opens the WhatsApp app on phones and WhatsApp Web on desktop.

## Set it up for a real shop

1. Open **Admin → Settings** and enter the shop's WhatsApp number with country code (for example `919876543210`), UPI ID and delivery charges.
2. To change the defaults for every new visitor, edit `js/data.js` (shop settings, parts catalogue, sample orders).
3. Add part photos from **Admin → Parts & stock → Edit → Photo URL**, or set `img` on a product in `js/data.js` (for example `img: 'images/brake-pad.jpg'` after adding the file to an `images/` folder). Parts without a photo show a category drawing.

## Demo limitations

- Data is stored in each visitor's browser (`localStorage`). Orders placed on a customer's phone appear in *that* browser's admin, not on the seller's device. The seller receives the order through WhatsApp, which is the source of truth in this demo.
- The admin PIN is checked in the browser and is only a demo gate, not real security.
- To share orders and stock across devices, connect a backend such as Supabase or Firebase.

## Files

```
index.html            page markup
css/style.css         styles, light and dark themes
js/data.js            starting catalogue, settings and sample orders
js/app.js             shop, cart, checkout, admin and WhatsApp logic
manifest.webmanifest  install as an app on phones
sw.js                 offline cache (bump VERSION after edits)
icons/                app icons
```

## Run locally

```
python3 -m http.server 8000
```

Then open http://localhost:8000.
