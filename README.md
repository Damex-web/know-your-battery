# Know Your Battery

A responsive, no-framework starter built with HTML5, CSS3 and vanilla JavaScript.

## Files
- `index.html` — dashboard, navigation and calculator markup
- `style.css` — colors, layout, responsive breakpoints and component styling
- `script.js` — navigation, mobile menu, input validation, battery calculations, recent-calculation UI and the Three.js interactive 3D pack builder

## Run it
Clone or download this repository, then serve the project folder from a local web server and open the local address in your browser. For example, with Python installed, run `python -m http.server 8000` from the project folder and visit `http://localhost:8000`. No build step or package installation is required. To use the contact form, configure the EmailJS credentials and template as described below.

## Calculator formulas
- Pack nominal voltage (V) = cell nominal voltage (V) × cells in series (S)
- Pack capacity (Ah) = cell capacity (Ah) × parallel groups (P)
- Total cell count = S × P
- Nominal energy (Wh) = pack nominal voltage × pack capacity

## Assumptions and safety
The initial calculator assumes identical, correctly matched cells and uses nominal values. It does not calculate voltage under load, usable capacity, thermal behavior, current limits, charge profile, ageing, wiring losses, BMS design or fault conditions. Validate all real builds against the manufacturer's datasheet and applicable safety standards. This tool is educational and is not a certified engineering design.

## 3D Pack Builder
The builder uses Three.js for its interactive 3D scene. It visualizes up to 96 cells (12S8P) and calculates nominal voltage, capacity, energy, and load power. The model is illustrative: its wires are conceptual and are not a validated physical wiring plan.

- Pack voltage = cell voltage × series count
- Pack capacity = cell capacity × parallel count
- Nominal energy = pack voltage × pack capacity
- Nominal DC power estimate = pack voltage × load current


## Brand assets
- `logo.png` — full Know Your Battery logo.
- `logo-mark.png` — compact battery emblem used in the sidebar and loading screen.
- `icons/` — favicon, Apple home-screen icon, and PWA install icons generated from the emblem.

## About, support, and legal pages
The application includes About, Contact, Help / FAQ, Privacy Policy, Terms of Use, and Engineering Disclaimer pages. Footer links open these pages inside the existing single-page navigation. The sidebar remains focused on workspace tools.

## Netlify deployment

This is a static site with no build step. `netlify.toml` sets the project root as the publish directory. After creating the Netlify site, verify that the deployed HTTPS address is `https://knowyourbattery.netlify.app`; the site name must be available in Netlify. Add that exact origin to EmailJS before expecting live form submissions.

## Contact form setup

The contact form uses the EmailJS browser SDK and sends enquiries to the project Gmail inbox. The initial host is Netlify at https://knowyourbattery.netlify.app. A custom .com domain may be connected later; the domain name and hosting service are separate.

1. In EmailJS, connect the Gmail service that should receive enquiries.
3. In EmailJS, allow https://knowyourbattery.netlify.app as an origin before accepting live submissions.
4. The current EmailJS service ID, template ID, and public key are configured in EMAILJS_CONFIG at the top of script.js. If you change them, update those values. Never put an EmailJS private key or Gmail password in the site.
5. Submit a test enquiry from the deployed site and confirm it arrives in Gmail. The form shows success only after EmailJS accepts the submission. If EmailJS is not configured or the service fails, the page shows a failure message and the direct email link remains available.

EmailJS Gmail connections may be subject to Gmail sending limits and spam controls. Check the EmailJS and Gmail account settings before relying on the form for high-volume use.

## Sharing and installation
The site includes `ogimage.png`, Open Graph metadata, and a large-image Twitter/X card. The canonical, `og:url`, `og:image`, and `twitter:image` point to https://knowyourbattery.netlify.app; keep them synchronized if the public address changes. Social crawlers require the image to be publicly reachable after deployment.

The web app manifest and generated icons support installation and Add to Home Screen when served from a secure HTTPS origin.
No service worker is included, so this setup does not add offline caching.

## Privacy and terms
The Privacy Policy and Terms of Use in the application are written for Know Your Battery, operated by Okunlola Damilola in Nigeria. The app stores the theme preference in browser local storage and up to five calculations explicitly saved by the visitor in IndexedDB on this device. Calculator values not saved by the visitor remain in page memory. These items do not sync to a server.

The app loads fonts from Google Fonts, Font Awesome, Three.js from cdnjs, and OrbitControls from jsDelivr. Netlify is the planned initial host at https://knowyourbattery.netlify.app, and a custom .com domain may be connected later. Review Netlify account features and any analytics, cookies, logs, or other integrations enabled for the deployment before launch. EmailJS sends contact form submissions to the Gmail address above. Review the Netlify and EmailJS privacy information.
