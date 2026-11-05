# Info Vibe Profile 🌟

A modern, highly interactive, and responsive personal portfolio website built with **React**, **TypeScript**, and **Vite**. This project showcases professional skills, experience, and GitHub projects with a premium, animated user interface.

![Project Preview](./public/preview.png)
*(Note: Add a preview screenshot to your public folder if you have one)*

## ✨ Features

-   **Dynamic Visuals**: Stunning "Gravity Stars" background animation and smooth section transitions using `framer-motion`.
-   **Live GitHub Data**: Automatically fetches and displays your user profile and top repositories using the GitHub API.
-   **Smart Persistence**:
    -   **Caching**: Caches API data in specific local storage keys with a 1-hour expiry to prevent rate limiting.
    -   **Mock Fallback**: robustly falls back to mock data if the API fails or is rate-limited.
-   **Intelligent Navigation**:
    -   **Scroll Sync**: URL path updates automatically as you scroll (`/skills`, `/projects`).
    -   **Smart Highlight**: Navigation bar emphasizes the section that occupies the most screen space, not just the one touching the top.
-   **Internationalization (i18n)**: Full support for **English** and **Vietnamese** toggling.
-   **Global Dark Mode**: Seamless dark/light theme switching with persistent preferences.

## 🛠️ Tech Stack

-   **Core**: React 19, TypeScript, Vite 7
-   **Styling**: Tailwind CSS
-   **Animations**: Framer Motion
-   **State/Data**: Custom Hooks (`useGitHubData`, `useActiveSection`), LocalStorage
-   **Internationalization**: i18next, react-i18next
-   **Icons**: React Icons (Fa, Si)

## 🚀 Getting Started

### Prerequisites

-   Node.js **20.19+** hoặc **22.12+** (Vite 7 yêu cầu)
-   npm hoặc yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/phamngocan2412/info-vibe-web.git
    cd info-vibe-web
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```

4.  Build for production:
    ```bash
    npm run build
    ```

## ☁️ Deployment

- **Cloudflare Pages**: xem [`DEPLOY_CLOUDFLARE.md`](./DEPLOY_CLOUDFLARE.md)
- **Coolify / Docker / Nginx**: xem [`DEPLOY.md`](./DEPLOY.md)

Biến môi trường bắt buộc khi build:

```bash
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<sb_publishable_... hoặc anon key>
# Tên cũ vẫn được hỗ trợ: VITE_SUPABASE_ANON_KEY
```

## 📂 Project Structure

```
src/
├── components/       # UI Components (Hero, About, Skills, etc.)
│   ├── animate-ui/   # Complex animated components (GravityStars)
├── hooks/            # Custom hooks (useGitHubData, useActiveSection)
├── locales/          # i18n JSON translation files
├── types/            # TypeScript interfaces
├── data/             # Mock data and static content
└── utils.ts          # Helper functions (cn)
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
