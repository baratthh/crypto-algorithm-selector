# Project Architecture

This document outlines the architecture of the Cryptographic Algorithm Selector expert system.

## Overview

The project is designed as a **static web application**. The entire user interface and recommendation logic run directly in the user's browser without needing a backend server after the initial files are loaded. A Python script is used at build time to assemble the static site from templates and data sources.

## Components

1.  **Knowledge Base (`knowledge_base/`)**
    * Stores information about cryptographic algorithms, compliance standards, and common use cases in simple **JSON format**.
    * `algorithms.json`: Contains details for each algorithm (type, security level, performance, key sizes, description, strengths, weaknesses, etc.).
    * `compliance_standards.json`: Defines various standards and their recommended/prohibited algorithms.
    * `use_cases.json`: Maps typical use cases to predefined security/performance priorities.

2.  **Core Logic (`core/`)**
    * Contains the Python modules responsible for the recommendation engine.
    * `knowledge_loader.py`: Loads the JSON data from the `knowledge_base`.
    * `scoring_system.py`: Implements the `calculate_score` function, which evaluates an algorithm against user requirements based on rules derived from the knowledge base.

3.  **Build Script (`build.py`)**
    * A Python script that orchestrates the static site generation.
    * Uses the **Jinja2** templating engine to render the main HTML structure (`templates/index.html`).
    * Copies static assets (CSS, JavaScript, images) from `static/` to the output directory (`dist/static/`).
    * **Crucially**, it copies the JSON files from `knowledge_base/` into `dist/static/data/`, making the data directly accessible to the frontend JavaScript via `fetch`.

4.  **Frontend (`static/`, `templates/`)**
    * `templates/index.html`: The main Jinja2 HTML template.
    * `static/styles.css`: Contains all CSS rules for styling the application.
    * `static/main.js`: Contains all the client-side JavaScript logic:
        * Fetches the JSON data (`algorithms.json`, etc.) from `/static/data/`.
        * Manages application state (current view, user inputs, recommendations).
        * Implements the user interface (wizard, algorithm explorer, comparison view).
        * **Re-implements the scoring logic** in JavaScript (`calculateScore` function) to provide recommendations directly in the browser based on user input and the fetched data.
        * Handles navigation and user interactions.
    * `static/favicon.svg`: The website icon.

5.  **Testing (`tests/`)**
    * Contains unit tests for the Python scoring system.
    * `test_cases.json`: Defines various scenarios and expected outcomes.
    * `test_scoring_system.py`: Uses Python's `unittest` module to run tests against the `scoring_system.py` logic using the defined test cases.

6.  **Output (`dist/`)**
    * The generated static website, ready for deployment. Contains `index.html` and the `static/` subdirectory with CSS, JS, and data.

## Data Flow (User Interaction)

1.  User accesses `index.html`.
2.  `main.js` fetches `algorithms.json`, `compliance_standards.json`, and `use_cases.json`.
3.  User interacts with the UI (e.g., uses the recommendation wizard).
4.  `main.js` updates its internal state based on user input.
5.  When the user requests recommendations, the JavaScript `calculateScore` function runs for each algorithm against the user's requirements.
6.  `main.js` displays the ranked results, algorithm details, or comparison table by rendering the appropriate HTML content.
