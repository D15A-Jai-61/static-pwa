# Simple PWA

This is a simple static Progressive Web App (PWA) that demonstrates the capabilities of PWAs, including offline functionality and installation on devices. The app provides users with information about what a PWA is and how it enhances the web experience.

## Features

- **Responsive Design**: The app is designed to work on various screen sizes and orientations.
- **Offline Support**: The service worker caches essential files, allowing the app to function without an internet connection.
- **Installable**: Users can install the app on their devices, providing a native app-like experience.
- **Background Image**: The app features a customizable background image that adapts to different screen sizes.

## File Structure

The project is organized as follows:

/simple-pwa
│
├── index.html
├── manifest.json
├── service-worker.js
└── styles.css

## Getting Started

To run the app locally, you can use a local server (like `http-server` or `live-server`) to serve the files over HTTP or HTTPS. Ensure that the service worker is registered correctly for offline functionality.

## License

This project is open-source and available for anyone to use and modify.
