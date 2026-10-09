# ParkingFlow

A web application for finding and booking parking spots online. Built as a
learning project to practice front-end development with vanilla HTML, CSS and
JavaScript.

## Features

- **Multi-page SPA-style navigation** — seven sections (home, catalog,
  details, about, contacts, login, profile) switched without page reloads.
- **Interactive parking catalog** — 15 mock parking spots across 3 zones,
  with filtering by status and zone, and live search by spot number.
- **Booking flow** — select a free spot, choose date and time, get an
  automatic price calculation based on hourly rate.
- **User accounts** — simple login / register form with session persistence
  via `localStorage`.
- **Personal profile** — view active bookings and full session history,
  cancel bookings.
- **Responsive layout** — works on mobile, tablet and desktop.

## Tech Stack

- **HTML5** — semantic markup
- **CSS3** — custom properties, flexbox, grid, animations
- **Vanilla JavaScript (ES6+)** — no frameworks, no build step
- **Bootstrap 5** — layout and UI components (via CDN)
- **Font Awesome 6** — icons (via CDN)
- **Google Fonts** — Inter typeface (via CDN)

All data (parking spots, bookings, current user) is stored in the browser's
`localStorage`. There is no backend — this is a front-end only project.

## Project Structure

ParkingFlow/
├── index.html # Main page and app shell
├── css/
│ └── style.css # All custom styles
├── js/
│ └── main.js # Application logic
├── .vscode/ # Editor settings and recommended extensions
└── README.md

## Getting Started

No installation or build step required.

1. Clone the repository:
   ```bash
   git clone https://github.com/Arost235/ParkingFlow.git
   ```
2. Open the project folder in your editor.
3. Open index.html in a browser — or, if you're using VS Code, right-click
   index.html and choose Open with Live Server.

That's it. The app runs entirely in the browser.

## Author

Arost235 — github.com/Arost235
