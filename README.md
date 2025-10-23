# Cryptographic Algorithm Selector Expert System

<!--[![GitHub Pages Deploy](https://github.com/baratthh/crypto-algorithm-selector/actions/workflows/deploy.yml/badge.svg)](https://github.com/baratthh/crypto-algorithm-selector/actions/workflows/deploy.yml)-->
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

An intelligent, static web-based expert system that helps users make informed decisions about cryptographic algorithms based on their specific requirements, constraints, and compliance needs.

This project is generated using a Python script that processes a knowledge base of algorithms and renders a complete, interactive HTML, CSS, and JavaScript website.

**[Live Demo](https://baratthh.github.io/crypto-algorithm-selector/)** 

## Overview

Choosing the right cryptographic algorithm involves balancing multiple factors: security requirements, performance constraints, compliance standards, and implementation complexity. This tool transforms the complex decision-making process into an interactive, educational experience. It aims to enhance data security and instill confidence in users regarding cryptographic practices by offering correct and customized recommendations.

## Features ✨

-   **Intelligent Recommendation Engine**: A scoring system evaluates algorithms against user requirements, providing ranked recommendations with detailed reasoning. See the [Recommendation Logic](./docs/recommendation-logic.md) for details.
-   **Comprehensive Algorithm Database**: Detailed information on numerous cryptographic algorithms, managed in a simple JSON format (`knowledge_base/algorithms.json`).
-   **Interactive Interface**: A vanilla JavaScript single-page application experience with:
    * A step-by-step recommendation wizard.
    * An algorithm explorer with search, filter, and sort capabilities.
    * A side-by-side comparison tool for up to 4 algorithms.
-   **Static Site Generation**: The entire website is pre-built using a Python script (`build.py`) and Jinja2 templates, making it fast, secure, and easy to deploy.
-   **Zero Backend Required**: The final output is a collection of static files (`dist/`), eliminating the need for servers, databases, or runtime environments.

## Local Development 🛠️

### Prerequisites
-   Python 3.8+

### Setup
1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/crypto-algorithm-selector.git](https://github.com/YOUR_USERNAME/crypto-algorithm-selector.git)
    cd crypto-algorithm-selector
    ```
    *(Replace YOUR_USERNAME)*

2.  **Set up a virtual environment:**
    ```bash
    python -m venv venv
    # On Windows (Git Bash/PowerShell)
    .\venv\Scripts\activate
    # On macOS/Linux
    # source venv/bin/activate
    ```
   

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
   

4.  **Build the static website:**
    The Python build script processes the knowledge base and generates the static site in the `dist/` directory.
    ```bash
    python build.py
    ```
   

5.  **Serve the website locally:**
    You can use Python's built-in HTTP server to view the generated site.
    ```bash
    python -m http.server --directory dist 8000
    ```
   
    Now, open `http://localhost:8000` in your browser.

## Deployment 🚀

This project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) to automatically build and deploy the site to GitHub Pages whenever you push to the `main` branch.

1.  Push your code to the `main` branch of your GitHub repository.
2.  In your repository settings, go to **Settings** -> **Pages**.
3.  Under "Build and deployment", ensure the **Source** is set to **"GitHub Actions"**.
4.  The action will run automatically on the next push. You can also trigger it manually from the "Actions" tab.
5.  Your site will be available at `https://YOUR_USERNAME.github.io/crypto-algorithm-selector/` (replace `YOUR_USERNAME`).

## Project Structure 📁

````
crypto-algorithm-selector/
├── .github/workflows/   \# GitHub Actions workflow for deployment
│   └── deploy.yml
├── .gitignore           \# Specifies intentionally untracked files
├── build.py             \# Python script to generate the static site
├── core/                \# Python modules for core logic
│   ├── knowledge\_loader.py \# Loads data from knowledge\_base
│   └── scoring\_system.py   \# Implements the recommendation scoring logic
├── docs/                \# Additional documentation
│   ├── architecture.md
│   └── recommendation-logic.md
├── knowledge\_base/      \# JSON files containing algorithm/compliance data
│   ├── algorithms.json
│   ├── compliance\_standards.json
│   └── use\_cases.json
├── LICENSE              \# Project license file (MIT)
├── README.md            \# This file
├── requirements.txt     \# Python dependencies (Jinja2)
├── static/              \# Static assets (CSS, JS, Favicon)
│   ├── favicon.svg  
│   ├── main.js          \# Frontend JavaScript application logic
│   └── styles.css       \# CSS styles
├── templates/           \# Jinja2 HTML templates
│   └── index.html  
├── tests/               \# Unit tests for the scoring system
│   ├── test\_cases.json
│   └── test\_scoring\_system.py
└── dist/                \# Output directory for the generated static site (ignored by Git)

````

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.