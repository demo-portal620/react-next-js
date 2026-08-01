# Changelog

All notable changes to the admin-portal web app are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioned independently from the Android app and backend - each ships on
its own cadence, so their version numbers aren't kept in lockstep.

## [Unreleased]

## [1.0.0]

### Added
- Login, registration, and role/permission-based access control.
- Users, Roles, and Freelancers management pages, with CSV export.
- APK Versions page for uploading and managing Android app builds, with a
  QR code fallback for downloading a build directly on a phone.
- "Who's Online" live presence page.
- Inventory and Stock Checks pages, including CSV import for inventory and
  a work-site location setting used to flag off-site task submissions.
- Complaints page (raise/reply/resolve) and a live notification bell,
  updating in real time over WebSocket.
- Forgot password / reset password flow.
- Profile photo upload.
- IP whitelist admin page (disabled by default) - a demo of the
  network-level access gate common in regulated-industry admin panels.
- English/Chinese language toggle, with a type-checked guarantee that
  every label exists in both locale files.
- Search-as-you-type pickers replacing earlier fixed-page-size lookups
  (worker/product selection, role assignment).

### Fixed
- Duplicate/incorrect Authorization header handling on several API calls.
- Unescaped JSX entities and other lint issues blocking production builds.
- Low-contrast text and other small UI issues.

### Security
- Removed a public `permitAll()` rule left over from an earlier demo phase
  now that inventory data is real; access now requires authentication.
- Anti-enumeration on the forgot-password flow (same response whether or
  not the email is registered).
