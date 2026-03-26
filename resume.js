/**
 * Dynamic Resume Hydrator
 * Fetches 'tristan-smith.md' and populates the DOM
 */
async function loadResume() {
    try {
        const response = await fetch('tristan-smith.md');
        if (!response.ok) throw new Error('File not found');
        const markdown = await response.text();

        // Parse markdown into tokens for granular control
        const tokens = marked.lexer(markdown);

        // 1. Update Name and Document Title
        const h1Token = tokens.find(t => t.type === 'heading' && t.depth === 1);
        if (h1Token) {
            document.getElementById('user-name').innerText = h1Token.text;
            document.title = h1Token.text + ' - Resume';
        }

        // 2. Update Contact Information
        const contactToken = tokens.find(t => t.type === 'paragraph' && t.text.includes('|'));
        if (contactToken) {
            const parts = contactToken.text.split('|').map(p => p.trim().replace(/\*\*/g, ''));
            document.getElementById('contact-list').innerHTML = `
                <div class="contact-item"><i data-lucide="map-pin" size="16"></i><span>${parts[0]}</span></div>
                <div class="contact-item"><i data-lucide="phone" size="16"></i><span>${parts[1]}</span></div>
                <div class="contact-item"><i data-lucide="mail" size="16"></i><a href="mailto:${parts[2]}">${parts[2]}</a></div>
                <div class="contact-item"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg><a href="https://github.com/aviatorcards" target="_blank">github.com/aviatorcards</a></div>


            `;
        }

        // 3. Update Summary
        const summaryToken = tokens.find((t, i) => i > 0 && t.type === 'paragraph' && !t.text.includes('|'));
        if (summaryToken) {
            document.getElementById('user-summary').innerHTML = marked.parse(summaryToken.text);
        }

        // Helper: Get section content by heading title
        function getSectionHtml(title) {
            const startIdx = tokens.findIndex(t => t.type === 'heading' && t.text.toUpperCase().includes(title.toUpperCase()));
            if (startIdx === -1) return '';

            const nextHeadingIdx = tokens.findIndex((t, i) => i > startIdx && t.type === 'heading' && t.depth <= tokens[startIdx].depth);
            const sectionTokens = tokens.slice(startIdx + 1, nextHeadingIdx === -1 ? tokens.length : nextHeadingIdx);

            // Return parsed HTML (ignoring thematic breaks)
            return marked.parser(sectionTokens.filter(t => t.type !== 'hr'));
        }

        // 4. Update Main Content (Experience & Projects)
        document.getElementById('main-sections').innerHTML = `
            <section>
                <h2 class="section-title">Experience</h2>
                <div class="experience-content">${getSectionHtml('EXPERIENCE')}</div>
            </section>
            <section>
                <h2 class="section-title">Selected Projects</h2>
                <div class="projects-content">${getSectionHtml('SELECTED PROJECTS')}</div>
            </section>
        `;

        // 5. Update Sidebar Sections
        document.getElementById('sidebar-sections').innerHTML = `
            <div class="sidebar-section">
                <h3>Technical Skills</h3>
                <div class="skills-content">${getSectionHtml('SKILLS')}</div>
            </div>
            <div class="sidebar-section">
                <h3>Education</h3>
                <div class="education-content">${getSectionHtml('EDUCATION')}</div>
            </div>
            <div class="sidebar-section">
                <h3>Languages</h3>
                <div class="languages-content">${getSectionHtml('LANGUAGES')}</div>
            </div>
        `;

        // 6. Refresh Icons
        lucide.createIcons();

    } catch (err) {
        console.error('Failed to load resume markdown:', err);
        const summary = document.getElementById('user-summary');
        if (summary) {
            summary.innerHTML = `<p style="color: #64748b; font-style: italic;">Note: To see the dynamic version, this file must be served over HTTP (e.g., VS Code Live Server or "npx serve"). Loading directly via "file://" is blocked by browser security.</p>`;
        }
    }
}

// Initialize
loadResume();
