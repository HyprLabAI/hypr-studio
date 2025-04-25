# Hypr Studio ✨

An AI Image and Video Generation Playground powered by [HyprLab](https://hyprlab.io/). Built with React, TypeScript, and Tailwind CSS.

[![Hypr Studio Light Mode](https://raw.githubusercontent.com/HyprLabAI/hypr-studio/refs/heads/main/screenshot/hypr_studio_lightmode.jpeg)](https://raw.githubusercontent.com/HyprLabAI/hypr-studio/refs/heads/main/screenshot/hypr_studio_lightmode.jpeg)
[![Hypr Studio Dark Mode](https://raw.githubusercontent.com/HyprLabAI/hypr-studio/refs/heads/main/screenshot/hypr_studio_darkmode.jpeg)](https://raw.githubusercontent.com/HyprLabAI/hypr-studio/refs/heads/main/screenshot/hypr_studio_darkmode.jpeg)

## Overview

Hypr Studio provides a user-friendly web interface to interact with various cutting-edge AI image and video generation models available through the Hyprlab.io API. It allows users to easily experiment with different models, adjust parameters, view results, and manage their generation history locally.

## Features

*   **Multi-Model Support:** Seamlessly switch between different AI model providers and versions for both **Image** and **Video** generation.
    *   **Image Models:** OpenAI (DALL·E 2/3, GPT-Image), Black Forest Labs (Flux), Stable Diffusion (SDXL, SD3 variants), Recraft, Ideogram.
    *   **Video Models:** Kling, Google (Veo 2).
*   **Dynamic Parameter Forms:** Input forms automatically adapt to show only the relevant parameters for the currently selected model, based on configuration.
*   **Direct File Uploads:** Securely upload input images/videos (for control images, start/end frames, etc.) directly to a dedicated endpoint, avoiding browser limitations.
*   **Local Generation History:** Automatically saves generated images (as base64) and video metadata (URLs) to your browser's IndexedDB and LocalStorage.
*   **History Management:**
    *   View past generations with thumbnails/placeholders.
    *   Click to view full details (prompt, settings, result) in a modal.
    *   Reload settings from a previous generation back into the form.
    *   Import and Export history as a JSON file.
    *   Delete individual items or clear the entire history.
*   **Result Viewer:** Displays the latest generated image or video directly in the interface.
*   **Dark/Light Mode:** Toggle between themes using [DarkReader.js](https://darkreader.org/).
*   **Configuration:** Simple API key input stored locally.
*   **Responsive Design:** Layout adjusts for different screen sizes.

## Technology Stack

*   **Frontend Framework:** [React](https://reactjs.org/) (using Vite)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **API Client:** Native Fetch API
*   **Forms & UI:** React Hooks, [Lucide Icons](https://lucide.dev/), [React Dropzone](https://react-dropzone.js.org/)
*   **Schema Validation:** [Zod](https://zod.dev/) (for validating API request bodies based on model)
*   **Local Storage:** IndexedDB & LocalStorage API
*   **Dark Mode:** [DarkReader.js](https://darkreader.org/)

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm or yarn package manager
*   A HyprLab API Key

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/HyprLabAI/hypr-studio.git
    cd hypr-studio
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application should now be running on `http://localhost:5173` (or another port if 5173 is busy).

## Usage

1.  **Open the App:** Navigate to the running application in your browser.
2.  **Enter API Key:** Input your HyprLab API key into the designated field. It will be stored in your browser's LocalStorage for subsequent visits.
3.  **Select Generation Type:** Choose between the "Image" or "Video" tabs.
4.  **Select Model:** Use the model family tabs (e.g., "OpenAI", "Kling") and the "Model Version" dropdown to select the specific AI model you want to use.
5.  **Configure Parameters:** Fill in the required prompt and adjust any other available parameters. Use the drag-and-drop zones or click to upload any necessary input images/videos.
6.  **Generate:** Click the "Generate Image" or "Generate Video" button.
7.  **View Result:** The generated output will appear in the "Result" panel. Video generation may take time and involves polling; status updates will be shown.
8.  **Manage History:** Generated media is automatically added to the "History" section for later review, reloading settings, or deletion. Use the Import/Export buttons to manage your history data.

## Configuration

*   **API Key:** The primary configuration is your HyprLab API Key. This key is required to authenticate with the backend API for uploads and generation requests. It is stored securely in the browser's `localStorage`.
*   **Model Definitions:** Model parameters, families, default values, and validation rules are defined in `src/config/models.ts`.
*   **API Endpoints:** The Hyprlab API endpoints for generation and uploads are configured within the respective generator components (`src/components/ImageGenerator.tsx`, `src/components/VideoGenerator.tsx`) and the file upload component (`src/components/FileUpload.tsx`).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

*   Powered by the [HyprLab](https://hyprlab.io/).
*   Built by [l3on](https://github.com/l3ony2k) & Catto-Chan

---

*Enjoy Generating!*