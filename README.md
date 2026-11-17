# Aama Ko Bhanchha

A Nepali restaurant website and local reservation prototype.

## Run it in VS Code

1. Extract the project and open the `aama-ko-bhanchha` folder in VS Code.
2. With Node.js 20 or newer installed, open **Terminal → New Terminal** and run `node server.js`.
3. Open **http://127.0.0.1:3000**. Use the **Staff dashboard** link in the footer and the password printed in your terminal.

The server uses Node's built-in modules and needs no npm install. Keep it running while testing the website. Stop it with Ctrl+C.

## Preview pages with VS Code Live Preview

Open `public/index.html` using **Show Preview**. Styles, images and page links work in Live Preview. For booking requests and the staff dashboard, use the Node address printed in your terminal. If Live Preview already uses port 3000, stop Live Preview before starting Node.

## Page files

| Page | File |
| --- | --- |
| Home and testimonials | `public/index.html` |
| About | `public/about.html` |
| Our Story | `public/our-story.html` |
| Menu | `public/menu.html` |
| Gallery | `public/gallery.html` |
| Services | `public/services.html` |
| Pricing | `public/pricing.html` |
| Visit & Book | `public/visit-book.html` |
| Contact | `public/contact.html` |
| FAQ | `public/faq.html` |

## Test reservations

Submit a request from **Book a table**, sign in to the staff dashboard, then approve or decline the request. The server saves requests to `bookings.json` locally. The password changes when the server restarts unless you set the `STAFF_PASSWORD` environment variable.

## Customize the website

- Edit each page in its own HTML file. Contact and hours also appear in the shared footer and the booking page.
- Edit the design and mobile layout in `public/style.css`.
- The WebP files in `public/` include stills cropped from the recording. Replace them with the original photos if available.

This version runs locally. Approvals change the dashboard status and do not send email. Staff review availability manually.

## Recording-based design

The mobile recording guided the colors, typography, page layouts and navigation. The desktop layout adapts the same design. Food and interior imagery was cropped from the recording. The prices, testimonials, business history, contact details and hours reproduced from the preview are demo content and should be verified before publishing. Booking requests and the staff dashboard use the local Node server.
