# Admin Dashboard & Note Taker

A versatile, single-page admin dashboard built with vanilla JavaScript and Tailwind CSS. This application combines two key features into one seamless interface: a robust User Management system and a dynamic, persistent Note Taker.

**Status:** In Development

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge)](https://codesandbox.io/p/sandbox/mbt-admin-dashboard-readme-integration-9wx7t6)

## Features

### General
*   **Single-Page Application (SPA):** Switch between views without page reloads.
*   **Responsive Sidebar:** The main navigation is intuitive and works on all screen sizes.
*   **Persistent State:** All notes and users are saved to the browser's `localStorage`, so your data persists between sessions.
*   **Clean UI:** Built with Tailwind CSS for a modern and maintainable design.

### User Management
*   **Add & Delete Users:** Easily add new users through a clean modal form and delete existing ones.
*   **Live Search:** Instantly find users by typing their name or email.
*   **Filter by Role:** Filter the user list to show only specific roles (e.g., Administrator, Editor).

### Note Taker
*   **Create, Edit & Delete Notes:** Full CRUD functionality for your notes.
*   **Auto-Sorting:** Notes are automatically sorted by their last modification date, keeping the most relevant notes at the top.
*   **Pinning:** Pin important notes to keep them at the top of the list, regardless of when they were last edited.
*   **Live Search:** Instantly find notes by searching their title or content.
*   **Debounced Saving:** Typing in the editor is smooth and performant, with changes saved automatically after you stop typing.

## Getting Started

This project is designed to run directly in a browser without any build steps.

**Using CodeSandbox:**
1.  Open the [Live Demo link](https://codesandbox.io/p/sandbox/mbt-admin-dashboard-readme-integration-9wx7t6).
2.  The application will run automatically.

**Running Locally:**
1.  Download the project files (`index.html`, `src/index.js`).
2.  Open the `index.html` file in your web browser.

## Project Structure

*   `index.html`: The main HTML file. It acts as the "shell" for the application, containing the sidebar, the main content area, and the user modal.
*   `src/index.js`: The "brain" of the application. This file contains all the JavaScript logic, structured into three main objects:
    *   **`AppManager`**: The top-level controller that manages the current view (`users` or `notes`) and handles navigation.
    *   **`UsersView`**: An object responsible for all logic and rendering related to the User Management dashboard.
    *   **`NotesView`**: An object responsible for all logic and rendering related to the Note Taker feature.
