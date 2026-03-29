# Changelog

All notable changes to the **Alcohol Intake Tracker** project will be documented in this file.

## [1.1.0] - 2026-03-29

### Added
- **Email & Password Authentication:**
  - Users can now register and log in using their email and password.
  - Added a "Confirm Password" field to the registration form with validation.
- **Email Verification Flow:**
  - Automatic verification email sent upon registration.
  - Restricted access to the app for unverified users with a dedicated verification screen.
  - Added "Check Verification Status" and "Resend Verification Email" functionality.
- **UI/UX Enhancements:**
  - Implemented auto-scroll and auto-focus for the "New Purchase" form when opened.
  - Added a "Check Verification" button to the auth screen to refresh user status.

### Changed
- **Layout Adjustments:**
  - Moved the "Add New Bottle" button to the bottom of the inventory list for better reachability.
  - Swapped the positions of the "Settings" and "Logout" buttons in the header.

## [1.0.0] - 2026-03-29

### Added
- **Initial Release:**
  - Mobile-first dashboard for tracking alcohol purchases and consumption.
  - Real-time Firestore integration for data persistence.
  - Google Sign-In support.
  - Inventory management (Add, Mark as Finished, Delete).
  - Consumption history and spending reports with Recharts.
  - Multi-currency support and Dark Mode.
