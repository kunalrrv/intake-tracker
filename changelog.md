# Changelog

All notable changes to the **Alcohol Intake Tracker** project will be documented in this file.

## [1.2.0] - 2026-03-29

### Added
- **Mood Tracker:**
  - Added a new "Mood" tab to track daily feelings after social events.
  - Implemented a "Mood Calculator" with a 1-5 rating system (smileys), date selection, and notes.
  - Integrated real-time mood history with pagination (5 entries per page).
  - Added navigation controls at both the top and bottom of the history list.
  - Styled pagination indicators to be larger and bolder for better accessibility.
- **Reports Enhancements:**
  - Updated the Reports page to keep filters open by default for quicker access.
  - Added a collapsible toggle to the filter section to maximize screen space when needed.
  - Introduced a "Reset All" button that appears when filters are active.

### Changed
- **UI/UX Refinements:**
  - Renamed the "Help" tab to "Help Me" in the bottom navigation.
  - Removed confirmation dialogs for deleting bottles and clearing data to streamline the user experience.
  - Replaced `alert()` calls with integrated UI feedback for a more polished feel.
- **Security:**
  - Updated Firestore rules to include the new `moods` collection with strict ownership and data validation.
  - Ensured `uid` fields are immutable for both bottles and moods.

### Fixed
- **Add Bottle Form:**
  - Fixed a bug where the `uid` property was being incorrectly passed from the form, ensuring cleaner data handling.

## [1.1.0] - 2026-03-29

### Added
- **Help Me Page:**
  - Added a dedicated "Help" tab in the navigation.
  - Lists organizations like AA, SMART Recovery, and SAMHSA to help users reduce alcohol usage.
  - Includes descriptions, website links, and contact information for each resource.
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
