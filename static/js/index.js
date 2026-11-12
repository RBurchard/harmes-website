window.HELP_IMPROVE_VIDEOJS = false;

// More Works Dropdown Functionality
function toggleMoreWorks() {
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (dropdown && button) {
        if (dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
            button.classList.remove('active');
        } else {
            dropdown.classList.add('show');
            button.classList.add('active');
        }
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.more-works-container');
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (container && dropdown && button && !container.contains(event.target)) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Close dropdown on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const dropdown = document.getElementById('moreWorksDropdown');
        const button = document.querySelector('.more-works-btn');
        if (dropdown && button) {
            dropdown.classList.remove('show');
            button.classList.remove('active');
        }
    }
});

// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    const copyText = button ? button.querySelector('.copy-text') : null;
    
    if (bibtexElement && button) {
        navigator.clipboard.writeText(bibtexElement.textContent).then(function() {
            button.classList.add('copied');
            if (copyText) copyText.textContent = 'Copied!';
            
            setTimeout(function() {
                button.classList.remove('copied');
                if (copyText) copyText.textContent = 'Copy';
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy: ', err);
            const textArea = document.createElement('textarea');
            textArea.value = bibtexElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            button.classList.add('copied');
            if (copyText) copyText.textContent = 'Copied!';
            setTimeout(function() {
                button.classList.remove('copied');
                if (copyText) copyText.textContent = 'Copy';
            }, 2000);
        });
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (scrollButton) {
        if (window.pageYOffset > 300) {
            scrollButton.classList.add('visible');
        } else {
            scrollButton.classList.remove('visible');
        }
    }
});

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
    const carouselVideos = document.querySelectorAll('.results-carousel video');
    if (carouselVideos.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                video.play().catch(e => {
                    console.log('Autoplay prevented:', e);
                });
            } else {
                video.pause();
            }
        });
    }, {
        threshold: 0.5
    });
    
    carouselVideos.forEach(video => {
        observer.observe(video);
    });
}

// Escape HTML utility
function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// Format author list
function formatAuthors(authorships) {
    if (!authorships || !authorships.length) return 'Unknown authors';
    const names = authorships
        .map(a => (a.author && a.author.display_name) ? a.author.display_name : (a.name || ''))
        .filter(Boolean);
    if (!names.length) return 'Unknown authors';
    if (names.length <= 5) {
        return names.join(', ');
    }
    return names.slice(0, 4).join(', ') + ', et al.';
}

// Render publication cards into DOM
function renderPublications(publications, listElement, badgeElement, ZENODO_ID, ARXIV_ID) {
    if (!listElement) return;

    if (!publications || publications.length === 0) {
        return;
    }

    if (badgeElement) {
        badgeElement.innerHTML = `<i class="fas fa-book-open mr-1"></i> ${publications.length} publication${publications.length === 1 ? '' : 's'}`;
    }

    listElement.innerHTML = publications.map(work => {
        const title = escapeHTML(work.title || 'Untitled Publication');
        const authors = escapeHTML(formatAuthors(work.authorships));
        const year = work.publication_year || (work.publication_date ? work.publication_date.split('-')[0] : '');

        const loc = work.primary_location || {};
        const source = loc.source || {};
        let venue = source.display_name || '';
        if (venue.includes('arXiv')) {
            const arxivMatch = (work.doi || '').match(/26\d{2}\.\d{4,5}/);
            venue = arxivMatch ? `arXiv:${arxivMatch[0]}` : 'arXiv';
        } else if (venue.includes('Symposium on Wearable Computers')) {
            venue = 'ISWC';
        } else if (venue.includes('Research Square')) {
            venue = 'Research Square (Preprint)';
        } else if (venue.includes('Zenodo')) {
            venue = 'Zenodo';
        } else if (venue.includes('University of Birmingham Research Portal')) {
            venue = 'University of Birmingham Research Portal (Preprint)';
        }

        const refs = work.referenced_works || [];
        const citesZenodo = Boolean(work._citesZenodo) || refs.some(r => r.includes(ZENODO_ID));
        const citesArxiv = Boolean(work._citesArxiv) || refs.some(r => r.includes(ARXIV_ID));

        let citeBadge = '';
        if (citesZenodo && citesArxiv) {
            citeBadge = `<span class="tag is-success is-light is-rounded" title="This publication cites both the HARMES paper and dataset"><i class="fas fa-check-double mr-1"></i> Cites Paper & Dataset</span>`;
        } else if (citesZenodo) {
            citeBadge = `<span class="tag is-info is-light is-rounded" title="This publication cites the HARMES Zenodo dataset"><i class="fas fa-database mr-1"></i> Cites Dataset</span>`;
        } else if (citesArxiv) {
            citeBadge = `<span class="tag is-link is-light is-rounded" title="This publication cites the HARMES paper"><i class="fas fa-file-alt mr-1"></i> Cites Paper</span>`;
        } else {
            citeBadge = `<span class="tag is-info is-light is-rounded"><i class="fas fa-quote-right mr-1"></i> Cites HARMES</span>`;
        }

        const landingUrl = loc.landing_page_url || work.doi || `https://openalex.org/${work.id}`;
        const doiUrl = work.doi || '';
        const pdfUrl = loc.pdf_url || '';

        return `
        <div class="publication-card">
          <div class="publication-card-title">
            <a href="${escapeHTML(landingUrl)}" target="_blank" rel="noopener noreferrer">
              ${title}
            </a>
          </div>
          <div class="publication-card-authors">
            <i class="fas fa-user-friends mr-1 is-size-7"></i> ${authors}
          </div>
          <div class="publication-card-meta">
            <div class="publication-card-tags">
              ${year ? `<span class="tag is-dark is-light is-rounded"><strong>${escapeHTML(String(year))}</strong></span>` : ''}
              ${venue ? `<span class="tag is-primary is-light is-rounded">${escapeHTML(venue)}</span>` : ''}
              ${citeBadge}
            </div>
            <div class="publication-card-actions">
              ${doiUrl ? `
                <a href="${escapeHTML(doiUrl)}" target="_blank" rel="noopener noreferrer" class="button is-small is-rounded is-outlined is-dark" title="Open DOI">
                  <span class="icon is-small"><i class="fas fa-external-link-alt"></i></span>
                  <span>DOI</span>
                </a>
              ` : ''}
              ${pdfUrl ? `
                <a href="${escapeHTML(pdfUrl)}" target="_blank" rel="noopener noreferrer" class="button is-small is-rounded is-outlined is-danger" title="Open PDF">
                  <span class="icon is-small"><i class="fas fa-file-pdf"></i></span>
                  <span>PDF</span>
                </a>
              ` : ''}
              <a href="${escapeHTML(landingUrl)}" target="_blank" rel="noopener noreferrer" class="button is-small is-rounded is-outlined is-link" title="View Publication">
                <span class="icon is-small"><i class="fas fa-book"></i></span>
                <span>View</span>
              </a>
            </div>
          </div>
        </div>`;
    }).join('');
}

// Automatically populate publications citing HARMES
async function loadPublications() {
    const listElement = document.getElementById('publications-list');
    const badgeElement = document.getElementById('publications-count-badge');
    if (!listElement) return;

    const ZENODO_ID = 'W7156615923'; // OpenAlex work ID for 10.5281/zenodo.19425718
    const ARXIV_ID = 'W7160246476';  // OpenAlex work ID for arXiv:2605.02596
    const CACHE_KEY = 'harmes_citing_pubs_v2';
    const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

    const selfIds = new Set([
        ZENODO_ID,
        ARXIV_ID,
        'https://openalex.org/' + ZENODO_ID,
        'https://openalex.org/' + ARXIV_ID
    ]);

    const selfDois = [
        '2605.02596',
        '19425718',
        '19425719',
        '23416820'
    ];

    // Check localStorage cache to avoid querying on every page refresh
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.timestamp && (Date.now() - parsed.timestamp < CACHE_TTL_MS) && Array.isArray(parsed.publications)) {
                renderPublications(parsed.publications, listElement, badgeElement, ZENODO_ID, ARXIV_ID);
                return;
            }
        }
    } catch (e) {
        // LocalStorage disabled or unavailable; fall through to fetch
    }

    try {
        // Query both OpenAlex citation graph and full-text identifier mentions
        // (catches repository preprints whose Zenodo/arXiv references aren't linked in referenced_works)
        const citesUrl = `https://api.openalex.org/works?filter=cites:${ZENODO_ID}|${ARXIV_ID}&sort=publication_date:desc&per-page=50`;
        const zenodoFulltextUrl = `https://api.openalex.org/works?filter=fulltext.search:${encodeURIComponent('("19425718" OR "19425719" OR "23416820")')}&sort=publication_date:desc&per-page=50`;
        const arxivFulltextUrl = `https://api.openalex.org/works?filter=fulltext.search:${encodeURIComponent('"2605.02596"')}&sort=publication_date:desc&per-page=50`;

        const fetchJson = async (url) => {
            const resp = await fetch(url);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            return resp.json();
        };

        const settled = await Promise.allSettled([
            fetchJson(citesUrl),
            fetchJson(zenodoFulltextUrl),
            fetchJson(arxivFulltextUrl)
        ]);

        const anySucceeded = settled.some(r => r.status === 'fulfilled');
        if (!anySucceeded) {
            console.warn('All OpenAlex publication queries failed.');
            return;
        }

        const byTitle = new Map();

        const mergeWorks = (results, viaZenodo, viaArxiv) => {
            for (const work of results) {
                if (selfIds.has(work.id)) continue;
                const doi = (work.doi || '').toLowerCase();
                if (selfDois.some(d => doi.includes(d))) continue;
                if (work.title && work.title.toLowerCase().startsWith('harmes: a multi-modal dataset')) {
                    continue;
                }

                const normTitle = (work.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                const key = normTitle || work.id;
                const refs = work.referenced_works || [];
                const citesZ = viaZenodo || refs.some(r => r.includes(ZENODO_ID));
                const citesA = viaArxiv || refs.some(r => r.includes(ARXIV_ID));

                if (byTitle.has(key)) {
                    const existing = byTitle.get(key);
                    const mergedZ = existing._citesZenodo || citesZ;
                    const mergedA = existing._citesArxiv || citesA;
                    // Prefer a record with a DOI over one without
                    const preferred = (!existing.doi && work.doi) ? work : existing;
                    preferred._citesZenodo = mergedZ;
                    preferred._citesArxiv = mergedA;
                    byTitle.set(key, preferred);
                } else {
                    work._citesZenodo = citesZ;
                    work._citesArxiv = citesA;
                    byTitle.set(key, work);
                }
            }
        };

        if (settled[0].status === 'fulfilled') {
            mergeWorks(settled[0].value.results || [], false, false);
        }
        if (settled[1].status === 'fulfilled') {
            mergeWorks(settled[1].value.results || [], true, false);
        }
        if (settled[2].status === 'fulfilled') {
            mergeWorks(settled[2].value.results || [], false, true);
        }

        const publications = Array.from(byTitle.values()).sort((a, b) => {
            const dateA = a.publication_date || String(a.publication_year || '');
            const dateB = b.publication_date || String(b.publication_year || '');
            return dateB.localeCompare(dateA);
        });

        if (publications.length === 0) {
            return;
        }

        // Cache results in localStorage
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({
                timestamp: Date.now(),
                publications: publications
            }));
        } catch (e) {
            // Storage quota or disabled; ignore
        }

        renderPublications(publications, listElement, badgeElement, ZENODO_ID, ARXIV_ID);

    } catch (err) {
        console.error('Failed to auto-populate publications:', err);
    }
}

// Initialise upon page load
function initPage() {
    // Bulma Carousel / Slider if present
    if (typeof bulmaCarousel !== 'undefined') {
        bulmaCarousel.attach('.carousel', {
            slidesToScroll: 1,
            slidesToShow: 1,
            loop: true,
            infinite: true,
            autoplay: true,
            autoplaySpeed: 5000,
        });
    }

    if (typeof bulmaSlider !== 'undefined') {
        bulmaSlider.attach();
    }

    setupVideoCarouselAutoplay();
    loadPublications();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
} else {
    initPage();
}
