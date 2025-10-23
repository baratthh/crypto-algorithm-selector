document.addEventListener('DOMContentLoaded', async () => { 
    const appRoot = document.getElementById('app-root'); 

    try {
        // Function to fetch and parse a single JSON file
        const loadJsonData = async (url) => {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error fetching ${url}: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
             if (typeof data !== 'object' || data === null || Object.keys(data).length === 0) {

                const text = await response.text(); 
                 if (text.trim() !== '{}') {
                    throw new Error(`Parsed data from ${url} is empty or not an object.`);
                 } else {
                     console.warn(`Data from ${url} is an empty object '{}'.`);
                     return {};
                 }
             }
            console.log(`Successfully loaded and parsed data from ${url}`);
            return data;
        };

        const [algorithmsData, complianceData, useCasesData] = await Promise.all([
            loadJsonData('static/data/algorithms.json'),
            loadJsonData('static/data/compliance_standards.json'),
            loadJsonData('static/data/use_cases.json')
        ]);

        // Assign data to window object
        window.ALGORITHMS_DB = algorithmsData;
        window.COMPLIANCE_DB = complianceData;
        window.USE_CASES_DB = useCasesData;

        console.log("All data loaded successfully.");

    } catch (e) {
        console.error("CRITICAL ERROR loading/parsing JSON:", e);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `<strong>Error: Could not load application data.</strong><br>Check console (F12) for details.<br><small>${e.message}</small>`;
        if (appRoot) { appRoot.innerHTML = ''; appRoot.appendChild(errorDiv); }
        return;
    }


    const app = {
        root: appRoot, 
        state: {
            currentView: 'home',
            wizardStep: 1,
            defaultRequirements: {
                dataType: '',
                securityPriority: 5,
                performancePriority: 5,
                useCase: '',
                compliance: [],
                quantumConcern: false
            },
            userRequirements: {}, 
            recommendations: [],
            selectedAlgorithm: null,
            previousView: 'home',
            comparisonList: [],
            exploreFilters: {
                searchTerm: '',
                type: 'all',
                sortBy: 'name-asc'
            }
        },

    icons: {
      home: `<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
      
            explore: `<svg class="icon icon-lg"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor" 
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        >
        <path d="M6 21l6 -5l6 5" />
        <path d="M12 13v8" />
        <path d="M3.294 13.678l.166 .281c.52 .88 1.624 1.265 2.605 .91l14.242 -5.165a1.023 1.023 0 0 0 .565 -1.456l-2.62 -4.705a1.087 1.087 0 0 0 -1.447 -.42l-.056 .032l-12.694 7.618c-1.02 .613 -1.357 1.897 -.76 2.905z" />
        <path d="M14 5l3 5.5" />
        </svg>
        `,
            
            compare: `<svg class="icon icon-lg"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        >
        <path d="M7 20l10 0" />
        <path d="M6 6l6 -1l6 1" />
        <path d="M12 3l0 17" />
        <path d="M9 12l-3 -6l-3 6a3 3 0 0 0 6 0" />
        <path d="M21 12l-3 -6l-3 6a3 3 0 0 0 6 0" />
        </svg>
        `,
            
            wizard: `
        <svg class="icon icon-lg"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        >
        <path d="M9 11l3 3l8 -8" />
        <path d="M20 12v6a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h9" />
        </svg>
        `,
      search: `<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`,
      check: `<svg class="icon text-green" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
      alert: `<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`,
      info: `<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
      logo: `<svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`,
    },

        init() {
            // Clone the default state to start
            this.state.userRequirements = { ...this.state.defaultRequirements };
            this.root.addEventListener('click', this.handleDelegatedEvents.bind(this));
            this.root.addEventListener('input', this.handleDelegatedInput.bind(this));
            // Navigate only if data loaded successfully (checked above)
            // Ensure ALGORITHMS_DB is checked as it's primary
            if (window.ALGORITHMS_DB && Object.keys(window.ALGORITHMS_DB).length > 0) {
                 this.navigateTo('home');
            } else {
                 console.warn("App initialization skipped due to data loading failure.");
                 // The error message is already shown by the fetch logic
            }
        },

         navigateTo(view, data = null) {
            this.state.previousView = this.state.currentView;
            this.state.currentView = view;

            if (data) {
                if (view === 'detail') this.state.selectedAlgorithm = data;
            }

            if (view === 'wizard-start') {
                this.state.currentView = 'wizard';
                this.state.wizardStep = 1;
                this.state.userRequirements = { ...this.state.defaultRequirements };
            }

            this.render();
        },

        handleDelegatedEvents(e) {
            const navTarget = e.target.closest('[data-nav]');
            const wizardNext = e.target.closest('[data-wizard-next]');
            const wizardPrev = e.target.closest('[data-wizard-prev]');
            const dataTypeBtn = e.target.closest('[data-datatype]');
            const getRecsBtn = e.target.closest('[data-get-recs]');
            const addToCompare = e.target.closest('[data-add-compare]');
            const removeFromCompare = e.target.closest('[data-remove-compare]');
            const toggleCompare = e.target.closest('[data-toggle-compare]');

            if (navTarget) this.navigateTo(navTarget.dataset.nav, navTarget.dataset.key);
            if (wizardNext) this.state.wizardStep = (this.state.wizardStep || 1) + 1;
            if (wizardPrev) this.state.wizardStep = Math.max(1, (this.state.wizardStep || 1) - 1);

            if (wizardNext || wizardPrev) this.render();

            if (dataTypeBtn) {
                this.state.userRequirements.dataType = dataTypeBtn.dataset.datatype;
                this.state.wizardStep = 2;
                this.render();
            }
            if (getRecsBtn) this.generateRecommendations();
            if (addToCompare) {
                const key = addToCompare.dataset.addCompare;
                if (!this.state.comparisonList.includes(key) && this.state.comparisonList.length < 4) {
                    this.state.comparisonList.push(key);
                    this.render(); // Re-render to show update in comparison widget/button state
                }
            }
            if (removeFromCompare) {
                const key = removeFromCompare.dataset.removeCompare;
                this.state.comparisonList = this.state.comparisonList.filter(item => item !== key);
                this.render(); // Re-render to show update in comparison widget
            }
            if (toggleCompare) {
                 const key = toggleCompare.dataset.toggleCompare;
                 if (this.state.comparisonList.includes(key)) {
                     this.state.comparisonList = this.state.comparisonList.filter(i => i !== key);
                 } else if (this.state.comparisonList.length < 4) {
                     this.state.comparisonList.push(key);
                 }
                 this.render(); // Re-render compare page or widget
            }
        },

        handleDelegatedInput(e) {
            const targetId = e.target.id;
            let shouldReRender = false;
            let shouldReRenderGridOnly = false;

            // Wizard inputs
            if (targetId === 'security-slider' || targetId === 'performance-slider') {
                const key = targetId === 'security-slider' ? 'securityPriority' : 'performancePriority';
                this.state.userRequirements[key] = parseInt(e.target.value, 10);
                // Update the <span> value live
                const span = document.getElementById(`${key}-value`);
                if(span) span.textContent = e.target.value;

                if (this.state.userRequirements.useCase) {
                    this.state.userRequirements.useCase = "";
                    const select = document.getElementById('use-case-select');
                    if (select) select.value = ""; // Visually reset dropdown
                }
            }
            if (targetId === 'use-case-select') {
                const useCaseKey = e.target.value;
                this.state.userRequirements.useCase = useCaseKey;
                // Check USE_CASES_DB exists before accessing
                if (useCaseKey && window.USE_CASES_DB && window.USE_CASES_DB[useCaseKey]) {
                    // Pre-fill sliders
                    const reqs = window.USE_CASES_DB[useCaseKey].requirements;
                    this.state.userRequirements.securityPriority = reqs.security;
                    this.state.userRequirements.performancePriority = reqs.performance;
                }
                shouldReRender = true; // Re-render to show new slider values
            }
            if (e.target.name === 'compliance') {
                const { value, checked } = e.target;
                if (checked) {
                    this.state.userRequirements.compliance.push(value);
                } else {
                    this.state.userRequirements.compliance = this.state.userRequirements.compliance.filter(c => c !== value);
                }
                // No re-render needed for checkbox change
            }
            if (targetId === 'quantum-concern') {
                this.state.userRequirements.quantumConcern = e.target.checked;
                shouldReRender = true; // Re-render to show/hide the warning box
            }

            // Explore page inputs
            if (targetId === 'explore-search') {
                this.state.exploreFilters.searchTerm = e.target.value;
                shouldReRenderGridOnly = true;
            }
            if (targetId === 'explore-type-filter') {
                this.state.exploreFilters.type = e.target.value;
                shouldReRenderGridOnly = true;
            }
            if (targetId === 'explore-sort') {
                this.state.exploreFilters.sortBy = e.target.value;
                shouldReRenderGridOnly = true;
            }

            if (shouldReRender) {
                this.render();
                // Restore focus if it was lost during full re-render
                 const activeElement = document.activeElement;
                 if (activeElement && activeElement.id && activeElement.id === targetId) {
                     // Focus is likely still there
                 } else {
                    const el = document.getElementById(targetId);
                    // Ensure element exists before focusing
                    if (el && typeof el.focus === 'function') {
                        el.focus();
                        // Special handling for range inputs if needed
                        if (el.type === 'range') {
                           // May not be necessary depending on browser
                        }
                    }
                 }

            } else if (shouldReRenderGridOnly && this.state.currentView === 'explore') {
                const container = document.getElementById('explore-grid-container');
                if (container) {
                    container.innerHTML = this.renderExploreCardGrid();
                    // Keep focus on the search input
                    if (targetId === 'explore-search') {
                        const searchInput = document.getElementById('explore-search');
                        if (searchInput) {
                             searchInput.focus();
                             // Move cursor to end
                             searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length);
                        }
                    }
                }
            }
        },

        calculateScore(algoKey) {

            const algo = window.ALGORITHMS_DB[algoKey];
             // Handle cases where algo might not be found
             if (!algo) return 0;
            const req = this.state.userRequirements;
            let score = 0.0;

            if (req.dataType && algo.dataTypes.includes(req.dataType)) score += 20;

            const securityWeight = req.securityPriority / 5.0;
            const performanceWeight = req.performancePriority / 5.0;

            score += algo.securityLevel * securityWeight * 4;
            score += algo.performanceScore * performanceWeight * 4;

            if (req.useCase && algo.useCases.includes(req.useCase)) score += 15;

            req.compliance.forEach(comp => {
                const standard = window.COMPLIANCE_DB[comp];
                if (standard) {
                    if (standard.recommendedAlgorithms.includes(algoKey)) score += 10;
                    if (standard.prohibitedAlgorithms.includes(algoKey)) {
                        score = 0; return; // Early exit for prohibited
                    }
                }
            });

            if (algo.securityLevel < 3) score = 0; // Disqualify very insecure

            // Apply quantum penalty *after* base calculation but *before* final rounding
            if (req.quantumConcern && !algo.quantumResistant) {
                score *= 0.5;
            }

            return Math.round(score); // Return the potentially uncapped score for ranking
        },

        generateRecommendations() {
            const scored = Object.keys(window.ALGORITHMS_DB).map(key => ({
                key,
                score: this.calculateScore(key) // Use the raw, potentially > 100 score
            }));

            this.state.recommendations = scored
                .filter(item => item.score > 30) // Filter out very low scores
                .sort((a, b) => b.score - a.score) // Sort highest score first
                .slice(0, 5); // Take top 5

            this.navigateTo('results');
        },

        render() {
            const view = this.state.currentView;
            let contentHtml = '';

            try { // Add error handling for rendering
                if (view === 'home') contentHtml = this.renderHome();
                else if (view === 'wizard') contentHtml = this.renderWizard();
                else if (view === 'results') contentHtml = this.renderResults();
                else if (view === 'detail') contentHtml = this.renderDetail();
                else if (view === 'explore') contentHtml = this.renderExplore();
                else if (view === 'compare') contentHtml = this.renderCompare();
                else contentHtml = `<p>Error: View not found.</p>`; // Fallback
            } catch (error) {
                console.error("Render Error:", error);
                contentHtml = `<p>Error rendering view '${view}'. Please check console.</p>`;
            }

            // Render the full page structure including the nav bar
            this.root.innerHTML = `
                <nav class="main-nav">
                    <a href="#" class="nav-logo" data-nav="home">
                        ${this.icons.logo}
                        CryptoSelector
                    </a>
<div class="nav-links">
 <a href="#" class="nav-link ${view === 'home' ? 'active' : ''}" data-nav="home">
              ${this.icons.home} Home
            </a>
            <a href="#" class="nav-link ${view === 'wizard' ? 'active' : ''}" data-nav="wizard-start">
              ${this.icons.wizard.replace('icon-lg', 'icon')} Get Recommendation
            </a>
            <a href="#" class="nav-link ${view === 'explore' ? 'active' : ''}" data-nav="explore">
              ${this.icons.explore.replace('icon-lg', 'icon')} Explore
            </a>
            <a href="#" class="nav-link ${view === 'compare' ? 'active' : ''}" data-nav="compare">
              ${this.icons.compare.replace('icon-lg', 'icon')} Compare
            </a>
          </div>
                </nav>
                <div class="container">
                    ${contentHtml}
                </div>
            `;
        },

        // --- Render Functions for Each View ---

        renderHome() {
            return `
                <div class="view active" id="home-view">
                    <div class="home-header">
                        <h1>Cryptographic Algorithm Selector</h1>
                        <p>An expert system to help you choose the right encryption algorithm based on your specific needs.</p>
                    </div>
                    <div class="home-options">
                        <div class="option-card" data-nav="wizard-start">
                            ${this.icons.wizard}
                            <h3>Get Recommendation</h3>
                            <p>Answer a few questions for a personalized recommendation.</p>
                        </div>
                        <div class="option-card" data-nav="explore">
                            ${this.icons.explore.replace('icon-lg', 'icon-lg')}
                            <h3>Explore Algorithms</h3>
                            <p>Browse and learn about different cryptographic algorithms.</p>
                        </div>
                        <div class="option-card" data-nav="compare">
                            ${this.icons.compare.replace('icon-lg', 'icon-lg')}
                            <h3>Compare Algorithms</h3>
                            <p>View a side-by-side comparison of algorithm features.</p>
                        </div>
                    </div>
                    <div class="info-box">
                        <h3>${this.icons.info} Why Choose the Right Algorithm?</h3>
                        <p>Selecting an appropriate cryptographic algorithm involves balancing security requirements, performance constraints, compliance needs, and implementation complexity. The wrong choice can lead to security vulnerabilities or unnecessary computational overhead.</p>
                        <p>This tool helps you navigate these trade-offs by analyzing your specific requirements and providing evidence-based recommendations with detailed explanations.</p>
                    </div>
                </div>
            `;
        },

        renderWizard() {
            const step = this.state.wizardStep;

            const progress = `
                <div class="wizard-progress">
                    <div class="progress-step ${step >= 1 ? 'active' : ''}"></div>
                    <div class="progress-step ${step >= 2 ? 'active' : ''}"></div>
                    <div class="progress-step ${step >= 3 ? 'active' : ''}"></div>
                    <div class="progress-step ${step >= 4 ? 'active' : ''}"></div>
                </div>`;

            const navButtons = `
                <div class="wizard-buttons">
                    ${step > 1 ? `<button class="btn-secondary" data-wizard-prev>Previous</button>` : `<button class="btn-secondary" data-nav="home">Back to Home</button>`}
                    ${step < 4 ? `<button class="btn-primary" data-wizard-next>Continue</button>` : `<button class="btn-success" data-get-recs>Get Recommendations</button>`}
                </div>
            `;

            let stepContent = '';
            if (step === 1) {
                const dataTypes = {
                    text: 'Documents, messages, passwords',
                    image: 'Photos, graphics, scanned documents',
                    video: 'Video files, streaming content',
                    audio: 'Voice recordings, music files',
                    binary: 'Compiled code, databases, archives',
                    keys: 'Cryptographic keys, certificates'
                };
                stepContent = `
                    <h3>Step 1: What type of data do you need to protect?</h3>
                    <p style="color: var(--color-text-muted); margin-top: -0.5rem; margin-bottom: 1.5rem;">Different data types have different encryption requirements. Select the option that best matches your use case.</p>
                    <div class="data-type-grid">
                        ${Object.entries(dataTypes).map(([key, desc]) => `
                            <button class="data-type-btn ${this.state.userRequirements.dataType === key ? 'selected' : ''}" data-datatype="${key}">
                                <div class="data-type-title">${key.charAt(0).toUpperCase() + key.slice(1)}</div>
                                <div class="data-type-desc">${desc}</div>
                            </button>`).join('')}
                    </div>
                    ${navButtons}
                `;
            } else if (step === 2) {
                stepContent = `
                    <h3>Step 2: Security vs. Performance</h3>
<p style="color: var(--color-text-muted); margin-top: -0.5rem; margin-bottom: 1.5rem;">Higher security often means slower performance. Adjust the sliders to indicate your priorities.</p>                    <div class="slider-group">
            <label for="security-slider">
                        Security Priority 
                        <span>
                            <span id="securityPriority-value" class="slider-value">${this.state.userRequirements.securityPriority}</span>/10
                        </span>
                    </label>
            <input type="range" id="security-slider" min="1" max="10" value="${this.state.userRequirements.securityPriority}">
            <div class="slider-labels">
       <span>Basic protection</span>
              <span>Maximum security</span>
            </div>
          </div>
          <div class="slider-group">
            <label for="performance-slider">
                        Performance Priority 
                        <span>
                            <span id="performancePriority-value" class="slider-value">${this.state.userRequirements.performancePriority}</span>/10
                        </span>
                    </label>
            <input type="range" id="performance-slider" min="1" max="10" value="${this.state.userRequirements.performancePriority}">
            <div class="slider-labels">
              <span>Can be slow</span>
              <span>Must be fast</span>
           </div>
        </div>
                    ${navButtons}
                `;
            } else if (step === 3) {
                const useCases = window.USE_CASES_DB || {};
                const compliance = window.COMPLIANCE_DB || {};
                stepContent = `
                    <h3>Step 3: Use Case & Compliance</h3>
                    <p style="color: var(--color-text-muted); margin-top: -0.5rem; margin-bottom: 1.5rem;">Help us understand your specific application and regulatory requirements.</p>
<div class="form-group">
            <label for="use-case-select">Primary Use Case (Optional)</label>
            <select id="use-case-select">
              <option value="">-- Select a use case to pre-fill sliders --</option>
              ${Object.entries(useCases).map(([key, val]) => `
                            <option value="${key}" ${this.state.userRequirements.useCase === key ? 'selected' : ''}>
                                ${val.title}
                            </option>
                        `).join('')}
            </select>
          </div>
                    <div class="form-group">
                        <div>Compliance Requirements</div>
                        <div class="compliance-list">
                        ${Object.entries(compliance).map(([key, val]) => `
                            <label>
                                <input type="checkbox" name="compliance" value="${key}" ${this.state.userRequirements.compliance.includes(key) ? 'checked' : ''}>
                                <div>
                                    <div class="compliance-name">${val.name}</div>
                                    <div class="compliance-desc">${val.description}</div>
                                </div>
                            </label>
                        `).join('')}
                        </div>
                    </div>
                    ${navButtons}
                `;
            } else if (step === 4) {
                const req = this.state.userRequirements;
                stepContent = `
                    <h3>Step 4: Review and Confirm</h3>
                    <div class="form-group">
                        <div>Advanced Considerations</div>
                        <div class="compliance-list">
                            <label>
                                <input type="checkbox" id="quantum-concern" ${req.quantumConcern ? 'checked' : ''}>
                                <div>
                                    <div class="compliance-name">Quantum Computing Concern</div>
                                    <div class="compliance-desc">I need protection against future quantum computer attacks. Note: Most current algorithms are vulnerable to quantum computers. This will significantly limit your options.</div>
                                </div>
                            </label>
                        </div>
                    </div>

                    ${req.quantumConcern ? `
                        <div class="important-box">
                            ${this.icons.alert.replace('text-red', '')}
                            <div><strong>Important:</strong> Quantum-resistant algorithms are still being standardized by NIST. Currently deployed quantum-resistant options are limited and may not be suitable for all use cases. Consider using hybrid approaches that combine classical and post-quantum algorithms.</div>
                        </div>` : ''}

                    <div class="summary-box" style="margin-top: 2rem;">
                        <h4>Your Requirements Summary:</h4>
                        <ul>
                            <li><strong>Data Type:</strong> ${req.dataType || 'Not specified'}</li>
                            <li><strong>Security Priority:</strong> ${req.securityPriority}/10</li>
                            <li><strong>Performance Priority:</strong> ${req.performancePriority}/10</li>
                            <li><strong>Use Case:</strong> ${req.useCase ? (window.USE_CASES_DB[req.useCase]?.title || req.useCase) : 'Not specified'}</li>
                            <li><strong>Compliance:</strong> ${req.compliance.length > 0 ? req.compliance.join(', ') : 'None'}</li>
                            <li><strong>Quantum Concern:</strong> ${req.quantumConcern ? 'Yes' : 'No'}</li>
                        </ul>
                    </div>
                    ${navButtons}
                `;
            }

            return `
                <div class="view active wizard-view" id="wizard-view">
                    ${progress}
                    <div class="wizard-step">${stepContent}</div>
                </div>`;
        },

        renderResults() {
             const recs = this.state.recommendations;
             if (recs.length === 0) {
                 return `
                    <div class="view active" id="results-view">
                        <div class="wizard-header">
                            <h2>No Suitable Algorithms Found</h2>
                            <button data-nav="wizard-start" class="btn-primary">Start Over</button>
                        </div>
                        <div class="wizard-step">
                            <p>Based on your criteria, no algorithms were a strong match. Try relaxing your requirements.</p>
                        </div>
                    </div>
                 `;
             }

             return `
                 <div class="view active" id="results-view">
                     <div class="wizard-header">
                        <h2>Your Recommendations</h2>
                        <button data-nav="wizard-start" class="btn-secondary">← Start Over</button>
                    </div>
                     <div>
                         ${recs.map((rec, index) => {
                             const algo = window.ALGORITHMS_DB[rec.key];
                             if (!algo) return ''; // Safeguard
                             // Cap score at 100 for display only
                             const displayScore = Math.min(100, rec.score);
                             return `
                                 <div class="result-card ${index === 0 ? 'best-match' : ''}">
                                     <div class="result-header">
                                         <div class="result-title">
                                             <h3>${rec.key}</h3>
                                             <span>(${algo.name})</span>
                                             ${index === 0 ? `<span class="best-match-tag">Best Match</span>` : ''}
                                         </div>
                                         <div class="score-box">
                                            <div class="score">${displayScore}</div>
                                            <div class="score-label">Match Score</div>
                                         </div>
                                     </div>
                                     <div class="tags">
                                         <span class="tag ${algo.type === 'symmetric' ? 'tag-symmetric' : 'tag-asymmetric'}">${algo.type}</span>
                                         <span class="tag tag-security">Security: ${algo.securityLevel}/10</span>
                                         <span class="tag tag-performance">Performance: ${algo.performanceScore}/10</span>
                                     </div>
                                     <p style="margin-top: 1.5rem;">${algo.description}</p>
                                     <div class="reason-box">
                                         <h4>Why this algorithm?</h4>
                                         <p>${this.generateReasoning(rec.key)}</p>
                                     </div>
                                     <div class="strengths-weaknesses">
                                         <div>
                                             <h4 class="text-green">${this.icons.check} Strengths</h4>
                                             <ul>${algo.strengths.slice(0,3).map(s => `<li>${s}</li>`).join('')}</ul>
                                         </div>
                                         <div>
                                             <h4 class="text-red">${this.icons.alert} Weaknesses</h4>
                                             <ul>${algo.weaknesses.slice(0,3).map(w => `<li>${w}</li>`).join('')}</ul>
                                         </div>
                                     </div>
                                     <div class="actions">
                                        <button class="btn-primary" data-nav="detail" data-key="${rec.key}">View Details</button>
                                        <button class="btn-secondary" data-add-compare="${rec.key}" ${this.state.comparisonList.includes(rec.key) || this.state.comparisonList.length >= 4 ? 'disabled' : ''}>
                                            ${this.state.comparisonList.includes(rec.key) ? 'Added' : 'Add to Compare'}
                                        </button>
                                     </div>
                                 </div>
                             `;
                         }).join('')}
                     </div>
                     ${this.renderComparisonWidget()}
                 </div>
             `;
        },

        generateReasoning(algoKey) {
            // Updated to be closer to React's logic
            const algo = window.ALGORITHMS_DB[algoKey];
            const req = this.state.userRequirements;
            let reasons = [];
            if (!algo) return "Error generating reason."; // Safeguard

            if (req.dataType && algo.dataTypes.includes(req.dataType)) {
                 reasons.push(`Supports ${req.dataType} data encryption`);
            }
            if (req.securityPriority >= 8 && algo.securityLevel >= 8) {
                 reasons.push("Provides high security suitable for sensitive data");
            } else if (req.securityPriority <= 4 && algo.securityLevel <= 5) {
                reasons.push("Matches your lower security requirement");
            } else if (Math.abs(req.securityPriority - algo.securityLevel) <= 2) {
                reasons.push("Offers an appropriate security level");
            }

            if (req.performancePriority >= 8 && algo.performanceScore >= 8) {
                reasons.push("Offers excellent performance for high-throughput applications");
            } else if (req.performancePriority <= 4 && algo.performanceScore <= 5) {
                reasons.push("Fits your less demanding performance needs");
            } else if (Math.abs(req.performancePriority - algo.performanceScore) <= 2) {
                reasons.push("Provides suitable performance");
            }

            if (req.useCase && algo.useCases.includes(req.useCase)) {
                 reasons.push(`well-suited for ${req.useCase.replace(/-/g,' ')}`);
            }

            const compliantWith = algo.compliance.filter(c => req.compliance.includes(c));
            if (compliantWith.length > 0) {
                 reasons.push(`and is compliant with ${compliantWith.join(", ")}`);
            } else if (req.compliance.length > 0 && algo.compliance.length > 0) {
                 // Check if *any* listed compliance matches *any* required compliance (even if not recommended)
                 if (algo.compliance.some(c => req.compliance.includes(c))) {
                     reasons.push(`and meets ${req.compliance.join(", ")} requirements`);
                 }
            }

            if (reasons.length === 0) return "It provides a solid balance of features based on your input.";

            // Make it more sentence-like
            let sentence = `This algorithm ${reasons[0].toLowerCase()}`;
            if (reasons.length > 1) {
                sentence += `, ${reasons.slice(1, -1).join(", ")}`;
                if (reasons.length > 2) sentence += ",";
                 sentence += ` ${reasons[reasons.length - 1]}`;
            }
            return sentence + ".";
        },

        renderDetail() {
            const algoKey = this.state.selectedAlgorithm;
            const algo = window.ALGORITHMS_DB[algoKey];
            if (!algo) return `<p>Algorithm not found.</p>`; // Safeguard
            const backView = this.state.previousView && this.state.previousView !== 'detail' ? this.state.previousView : 'explore';

            return `
                <div class="view active detail-view" id="detail-view">
                    <button data-nav="${backView}" class="btn-secondary" style="margin-bottom: 1.5rem;">← Back</button>

                    <div class="detail-header">
                        <h2>${algoKey}</h2>
                        <p>${algo.name}</p>
                        <div class="tags" style="margin-top: 1rem;">
                            <span class="tag ${algo.type === 'symmetric' ? 'tag-symmetric' : 'tag-asymmetric'}">${algo.type.toUpperCase()}</span>
                            ${algo.quantumResistant ? `<span class="tag" style="background-color: var(--color-green);">Quantum Resistant</span>` : ''}
                            <span class="tag" style="background-color: var(--color-text-muted);">Introduced: ${algo.yearIntroduced}</span>
                        </div>
                    </div>

                    ${algo.securityLevel < 5 ? `<div class="security-warning">${this.icons.alert} <strong>Warning:</strong> This algorithm is considered weak or broken and should not be used in new systems.</div>` : ''}

                    <div class="detail-grid">
                        <div class="detail-metric"><div class="value">${algo.securityLevel}/10</div><div class="label">Security Level</div></div>
                        <div class="detail-metric"><div class="value">${algo.performanceScore}/10</div><div class="label">Performance</div></div>
                        <div class="detail-metric"><div class="value">${algo.keyLengths.join(', ')}</div><div class="label">Key Lengths (bits)</div></div>
                        <div class="detail-metric"><div class="value">${algo.blockSize ? `${algo.blockSize} bits` : 'Stream Cipher'}</div><div class="label">Block Size</div></div>
                    </div>

                    <div class="detail-section">
                        <h3>Overview</h3>
                        <p>${algo.description}</p>
                        <div class="detail-kv-grid">
                            <div class="detail-kv">
                                <div class="label">Supported Data Types</div>
                                <div class="value tag-list">
                                    ${algo.dataTypes.map(type => `<span class="tag" style="background-color: var(--color-text-muted);">${type}</span>`).join('')}
                                </div>
                            </div>
                            <div class="detail-kv">
                                <div class="label">Common Use Cases</div>
                                <div class="value tag-list">
                                     ${algo.useCases.map(uc => `<span class="tag" style="background-color: #e9ecef; color: var(--color-text-muted);">${uc}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <div class="strengths-weaknesses">
                             <div>
                                 <h4 class="text-green">${this.icons.check} Strengths</h4>
                                 <ul>${algo.strengths.map(s => `<li>${s}</li>`).join('')}</ul>
                             </div>
                             <div>
                                 <h4 class="text-red">${this.icons.alert} Weaknesses & Considerations</h4>
                                 <ul>${algo.weaknesses.map(w => `<li>${w}</li>`).join('')}</ul>
                             </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h3>Technical Details</h3>
                        <div class="detail-kv-grid">
                            <div class="detail-kv">
                                <div class="label">Computational Complexity</div>
                                <div class="value">${algo.complexity}</div>
                            </div>
                            <div class="detail-kv">
                                <div class="label">Quantum Resistant</div>
                                <div class="value">${algo.quantumResistant ? 'Yes' : 'No'}</div>
                            </div>
                             <div class="detail-kv">
                                <div class="label">Compliance Standards</div>
                                <div class="value tag-list">
                                    ${algo.compliance.length > 0 ? algo.compliance.map(c => `<span class="tag tag-symmetric">${c}</span>`).join('') : 'None'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h3>Real-World Usage</h3>
                        <p>${algo.realWorldUse}</p>
                        <div class="summary-box">
                            <strong>Implementation Availability:</strong> ${algo.implementation}
                        </div>
                    </div>
                </div>
            `;
        },

        renderExplore() {
            const { searchTerm, type, sortBy } = this.state.exploreFilters;
            // Ensure the select elements correctly show the current state
            return `
                <div class="view active" id="explore-view">
                    <h2>Explore Algorithms</h2>
                    <div class="explore-controls">
                        <div class="search-box">
                            ${this.icons.search}
                            <input type="search" id="explore-search" placeholder="Search by name..." value="${searchTerm}">
                        </div>
                        <select id="explore-type-filter" value="${type}">
                            <option value="all">All Types</option>
                            <option value="symmetric">Symmetric</option>
                            <option value="asymmetric">Asymmetric</option>
                        </select>
                        <select id="explore-sort" value="${sortBy}">
                            <option value="name-asc">Sort by Name (A-Z)</option>
                            <option value="name-desc">Sort by Name (Z-A)</option>
                            <option value="security-desc">Sort by Security (High-Low)</option>
                            <option value="performance-desc">Sort by Performance (High-Low)</option>
                        </select>
                    </div>
                    <div class="explore-grid" id="explore-grid-container">
                        ${this.renderExploreCardGrid()}
                    </div>
                </div>
            `;
        },

        renderExploreCardGrid() {
            // Renders only the grid part for performance
            const { searchTerm, type, sortBy } = this.state.exploreFilters;

            let filtered = Object.entries(window.ALGORITHMS_DB).filter(([key, algo]) => {
                const searchMatch = searchTerm === '' || key.toLowerCase().includes(searchTerm.toLowerCase()) || algo.name.toLowerCase().includes(searchTerm.toLowerCase());
                const typeMatch = type === 'all' || algo.type === type;
                return searchMatch && typeMatch;
            });

            // Apply sorting
            filtered.sort((a, b) => {
                const [keyA, algoA] = a;
                const [keyB, algoB] = b;
                switch (sortBy) {
                    case 'security-desc':
                        return algoB.securityLevel - algoA.securityLevel;
                    case 'performance-desc':
                        return algoB.performanceScore - algoA.performanceScore;
                    case 'name-desc':
                        return keyB.localeCompare(keyA);
                    case 'name-asc':
                    default:
                        return keyA.localeCompare(keyB);
                }
            });

            if (filtered.length === 0) {
                return `<p>No algorithms match your criteria.</p>`;
            }

            return filtered.map(([key, algo]) => `
                <div class="algo-card" data-nav="detail" data-key="${key}">
                    <h3>${key}</h3>
                    <p>${algo.name}</p>
                    <div class="tags">
                        <span class="tag ${algo.type === 'symmetric' ? 'tag-symmetric' : 'tag-asymmetric'}">${algo.type}</span>
                        <span class="tag tag-security">Security: ${algo.securityLevel}/10</span>
                        <span class="tag tag-performance">Performance: ${algo.performanceScore}/10</span>
                        <span class="tag" style="background-color: var(--color-text-muted);">Year: ${algo.yearIntroduced}</span>
                    </div>
                    ${algo.securityLevel < 5 ? `<div class="deprecated-warning">Insecure/Deprecated</div>` : ''}
                </div>
            `).join('');
        },

        renderCompare() {
            const list = this.state.comparisonList;
            const properties = [
                { key: 'name', label: 'Full Name' },
                { key: 'type', label: 'Type' },
                { key: 'securityLevel', label: 'Security Level' },
                { key: 'performanceScore', label: 'Performance Score' },
                { key: 'keyLengths', label: 'Key Lengths (bits)' },
                { key: 'blockSize', label: 'Block Size (bits)' },
                { key: 'yearIntroduced', label: 'Year Introduced' },
                { key: 'quantumResistant', label: 'Quantum Resistant' },
                { key: 'compliance', label: 'Compliance' },
            ];
            const getBarColor = (score) => score >= 8 ? 'var(--color-green)' : score >= 5 ? 'var(--color-yellow)' : 'var(--color-red)';

            return `
                <div class="view active" id="compare-view">
                    <h2>Compare Algorithms</h2>
                    <div class="comparison-controls">
                        <label>Select up to 4 algorithms to compare:</label>
                        <div class="comparison-grid">
                            ${Object.keys(window.ALGORITHMS_DB).sort().map(key => `
                                <button data-toggle-compare="${key}" class="${list.includes(key) ? 'selected' : ''}">${key}</button>
                            `).join('')}
                        </div>
                    </div>
                    ${list.length > 0 ? `
                    <div class="table-container">
                        <table class="comparison-table">
                            <thead>
                                <tr>
                                    <th>Property</th>
                                    ${list.map(key => `<th>${key}</th>`).join('')}
                                </tr>
                            </thead>
                            <tbody>
                                ${properties.map(prop => `
                                    <tr>
                                        <td data-label="${prop.label}"><strong>${prop.label}</strong></td>
                                        ${list.map(key => {
                                            const algo = window.ALGORITHMS_DB[key];
                                            if (!algo) return `<td data-label="${key}">N/A</td>`; // Safeguard
                                            let value = algo[prop.key];
                                            let displayValue = ''; // Store the final HTML/text

                                            if (prop.key === 'securityLevel' || prop.key === 'performanceScore') {
                                                // Generate HTML for bars directly, DO NOT ESCAPE
                                                displayValue = `
                                                    <strong>${value}/10</strong>
                                                    <div class="metric-bar-outer">
                                                        <div class="metric-bar-inner" style="width: ${value * 10}%; background-color: ${getBarColor(value)};"></div>
                                                    </div>
                                                `;
                                            } else {
                                                // Handle other types and escape them
                                                if (Array.isArray(value)) {
                                                    value = value.length > 0 ? value.join(', ') : 'None';
                                                } else if (typeof value === 'boolean') {
                                                    value = value ? 'Yes' : 'No';
                                                } else if (prop.key === 'blockSize' && !value) {
                                                    value = 'Stream Cipher';
                                                } else if (value === undefined || value === null) {
                                                     value = 'N/A'; // Handle missing data
                                                }
                                                // Escape HTML entities for plain text values
                                                displayValue = typeof value === 'string' ? value.replace(/</g, "&lt;").replace(/>/g, "&gt;") : String(value);
                                            }

                                            return `<td data-label="${key}">${displayValue}</td>`;
                                        }).join('')}
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div class="strengths-weaknesses" style="margin-top: 2rem;">
                         <div>
                             <h4 class="text-green">${this.icons.check} Key Strengths Comparison</h4>
                             ${list.map(key => {
                                 const algo = window.ALGORITHMS_DB[key];
                                 if (!algo) return '';
                                 return `
                                    <div class="detail-kv" style="margin-bottom: 1rem;">
                                        <div class="label" style="font-size: 1.1rem;">${key}</div>
                                        <ul style="padding-left: 1.2rem; margin: 0.5rem 0;">${algo.strengths.slice(0, 2).map(s => `<li>${s}</li>`).join('')}</ul>
                                    </div>
                                 `;
                             }).join('')}
                         </div>
                         <div>
                             <h4 class="text-red">${this.icons.alert} Key Limitations Comparison</h4>
                             ${list.map(key => {
                                 const algo = window.ALGORITHMS_DB[key];
                                  if (!algo) return '';
                                 return `
                                    <div class="detail-kv" style="margin-bottom: 1rem;">
                                        <div class="label" style="font-size: 1.1rem;">${key}</div>
                                        <ul style="padding-left: 1.2rem; margin: 0.5rem 0;">${algo.weaknesses.slice(0, 2).map(w => `<li>${w}</li>`).join('')}</ul>
                                    </div>
                                 `;
                             }).join('')}
                         </div>
                    </div>
                    ` : '<p>Select algorithms above to begin comparison.</p>'}
                </div>
            `;
        },

        renderComparisonWidget() {
            const list = this.state.comparisonList;
            if (list.length === 0) return '';
            return `
                <div class="comparison-widget">
                    <h4>Comparison List (${list.length}/4)</h4>
                    <div class="comparison-widget-list">
                        ${list.map(key => `
                            <span>${key} <button data-remove-compare="${key}">×</button></span>
                        `).join('')}
                    </div>
                    <button class="btn-primary" data-nav="compare">Compare Now</button>
                </div>
            `;
        }


    };

    app.init(); 
});
