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
                <div class="contact-item"><i data-lucide="github" size="16"></i><a href="https://github.com/fddl-dev" target="_blank">github.com/fddl-dev</a></div>
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

        // 4. Update Main Content (Experience)
        document.getElementById('main-sections').innerHTML = `
            <section>
                <h2 class="section-title">Experience</h2>
                <div class="experience-content">${getSectionHtml('EXPERIENCE')}</div>
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
