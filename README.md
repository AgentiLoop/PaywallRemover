# Paywall Remover

A Safari Web Extension for macOS that cleans up client-side paywall overlays, scroll locks, blurred content, and copy-protection notices.

## Features

- Removes matching paywall, subscription, registration, and sign-in overlays.
- Restores scrolling and text selection.
- Removes blurring, fading, gradient masks, and height restrictions from matching content containers.
- Suppresses certain page-level copy and context-menu restrictions.
- Watches for dynamically inserted overlays and reapplies cleanup.
- Provides global and per-site controls, plus a manual cleanup action and removed-element count.

## Limitations

This extension modifies content already present in the page. It does not retrieve articles withheld by a server, provide subscription credentials, or guarantee access to paid content.

Cleanup uses selectors and layout heuristics, so it may remove legitimate page elements or affect site behavior. If a page breaks, disable the extension for that site and reload it. Use the extension responsibly and respect publishers' content and access requirements.

## Build and enable

1. Clone or download this repository.
2. Open `Paywall Remover/Paywall Remover.xcodeproj` in Xcode.
3. Review the deployment targets and signing settings for both the macOS app and Safari extension; select your development team as needed.
4. Build and run the macOS app.
5. Open Safari's extension settings, enable **Paywall Remover**, and grant website access for the sites where you want it to run.

The repository contains a native macOS host app and an embedded Manifest V3 Safari Web Extension.

## Usage

Open the extension's toolbar popup on a webpage to view its status, toggle cleanup globally or for the current site, or trigger cleanup manually.

- The per-site toggle reloads the active tab automatically.
- After changing the global toggle, reload existing pages to apply the new setting.
- Manual cleanup explicitly activates cleanup for the current page.
- Disabling cleanup does not reconstruct elements already removed from a page; reload to restore the page.

## Permissions and settings

The extension manifest requests:

| Permission | Purpose |
| --- | --- |
| `storage` | Stores the global enabled setting and disabled-site list locally. |
| `activeTab` | Supports interaction with the active browser tab. |
| `scripting` | Declared by the extension manifest. |
| `<all_urls>` | Allows cleanup scripts to run across websites, subject to Safari's website-access controls. |

## Project structure

- `Paywall Remover/Paywall Remover/` — native macOS host application.
- `Paywall Remover/Paywall Remover Extension/` — Safari extension handler and resources.
- `Paywall Remover/Paywall Remover Extension/Resources/content.js` — overlay detection, cleanup, and page observation.
- `Paywall Remover/Paywall Remover Extension/Resources/content.css` — page styles.
- `Paywall Remover/Paywall Remover Extension/Resources/popup.html` and `popup.js` — extension controls and status.
- `Paywall Remover/Paywall Remover Extension/Resources/manifest.json` — extension metadata and permissions.