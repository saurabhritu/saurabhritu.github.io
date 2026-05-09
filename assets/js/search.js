document.addEventListener('DOMContentLoaded', () => {
  const searchModal = document.getElementById('search-modal');
  const searchOpeners = document.querySelectorAll('.search-opener');
  const searchClose = document.getElementById('search-close');
  let pagefindUI = null;

  function openSearch() {
    searchModal.classList.add('is-active');
    document.body.style.overflow = 'hidden';

    // Initialize Pagefind if not already done
    if (!pagefindUI && window.PagefindUI) {
      pagefindUI = new PagefindUI({
        element: "#pagefind-search",
        showSubResults: true,
        showImages: false,
        translations: {
          placeholder: "Search docs and blog..."
        }
      });
    }

    // Focus the input
    setTimeout(() => {
      const input = searchModal.querySelector('input');
      if (input) input.focus();
    }, 100);
  }

  function closeSearch() {
    searchModal.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  // Event Listeners
  searchOpeners.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openSearch();
    });
  });

  searchClose.addEventListener('click', closeSearch);

  // Close on backdrop click
  searchModal.addEventListener('click', (e) => {
    if (e.target === searchModal) closeSearch();
  });

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // Open on '/' (if not typing in an input)
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      openSearch();
    }

    // Close on 'Esc'
    if (e.key === 'Escape' && searchModal.classList.contains('is-active')) {
      closeSearch();
    }
  });
});
