document.addEventListener('DOMContentLoaded', () => {
    const cmdInput     = document.getElementById('cmd-input');
    const helpOverlay  = document.getElementById('help-overlay');
    const acBox        = document.getElementById('autocomplete-box');
    const statusFile   = document.getElementById('status-filename');
    const vimTab       = document.getElementById('vim-tab');
    const bufPortfolio = document.getElementById('buffer-portfolio');
    const bufGithub    = document.getElementById('buffer-github');

    const btnTheme   = document.getElementById('btn-theme');
    const iconSun    = document.getElementById('icon-sun');
    const iconMoon   = document.getElementById('icon-moon');
    const btnVim     = document.getElementById('btn-vim');
    const vimOverlay = document.getElementById('vim-overlay');
    const vimCloseBtn = document.getElementById('vim-close-btn');

    const validCommands = [
        ':e github.txt',
        ':github',
        ':help',
        ':linkedin',
        ':q',
        ':resume',
        ':wq'
    ];

    let acMatches = [];
    let acIndex   = -1;

    /* ---- Theme toggle ---- */

    btnTheme.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light');
        iconSun.style.display  = isLight ? 'none'  : 'block';
        iconMoon.style.display = isLight ? 'block' : 'none';
    });

    /* ---- Vim overlay toggle ---- */

    function openVim() {
        vimOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeVim() {
        vimOverlay.classList.remove('active');
        document.body.style.overflow = '';
        helpOverlay.style.display = 'none';
        hideAutocomplete();
        cmdInput.value = '';
        cmdInput.blur();
    }

    btnVim.addEventListener('click', () => {
        if (vimOverlay.classList.contains('active')) {
            closeVim();
        } else {
            openVim();
        }
    });

    vimCloseBtn.addEventListener('click', closeVim);

    /* ---- Autocomplete helpers ---- */

    function updateAutocomplete() {
        const val = cmdInput.value.toLowerCase();
        acMatches = val.length > 0
            ? validCommands.filter(c => c.startsWith(val) && c !== val)
            : [];
        acIndex = -1;
        renderAutocomplete();
    }

    function renderAutocomplete() {
        if (acMatches.length === 0) {
            acBox.style.display = 'none';
            acBox.innerHTML = '';
            return;
        }
        acBox.style.display = 'block';
        acBox.innerHTML = acMatches.map((cmd, i) => {
            const cls = i === acIndex ? 'ac-item active' : 'ac-item';
            return `<div class="${cls}" data-index="${i}">${cmd}</div>`;
        }).join('');
    }

    function acceptAutocomplete() {
        if (acIndex >= 0 && acIndex < acMatches.length) {
            cmdInput.value = acMatches[acIndex];
        } else if (acMatches.length > 0) {
            acIndex = 0;
            cmdInput.value = acMatches[0];
        }
        renderAutocomplete();
    }

    function hideAutocomplete() {
        acMatches = [];
        acIndex = -1;
        acBox.style.display = 'none';
        acBox.innerHTML = '';
    }

    /* ---- Global key listener: ":" focuses cmd input ---- */

    document.addEventListener('keydown', (e) => {
        /* Only capture ":" when vim overlay is open */
        if (e.key === ':' && vimOverlay.classList.contains('active') && document.activeElement !== cmdInput) {
            cmdInput.focus();
            cmdInput.value = ':';
            e.preventDefault();
            updateAutocomplete();
        }
        if (e.key === 'Escape') {
            if (helpOverlay.style.display === 'block') {
                helpOverlay.style.display = 'none';
            } else if (vimOverlay.classList.contains('active')) {
                closeVim();
            }
            cmdInput.value = '';
            cmdInput.blur();
            hideAutocomplete();
        }
    });

    /* ---- Click on autocomplete item ---- */

    acBox.addEventListener('mousedown', (e) => {
        const item = e.target.closest('.ac-item');
        if (item) {
            acIndex = parseInt(item.dataset.index, 10);
            acceptAutocomplete();
        }
    });

    /* ---- Input events on command bar ---- */

    cmdInput.addEventListener('input', updateAutocomplete);

    cmdInput.addEventListener('keydown', (e) => {
        /* Tab: cycle through autocomplete */
        if (e.key === 'Tab') {
            e.preventDefault();
            if (acMatches.length === 0) return;
            acIndex = (acIndex + 1) % acMatches.length;
            acceptAutocomplete();
            return;
        }

        /* Enter: execute command */
        if (e.key === 'Enter') {
            executeCommand(cmdInput.value.trim().toLowerCase());
            hideAutocomplete();
            return;
        }
    });

    /* ---- Command execution ---- */

    function switchBuffer(showId, filename, title) {
        bufPortfolio.classList.remove('active');
        bufGithub.classList.remove('active');
        document.getElementById(showId).classList.add('active');
        statusFile.textContent = filename;
        vimTab.textContent     = filename;
    }

    function executeCommand(cmd) {
        if (cmd === ':linkedin') {
            window.open('https://linkedin.com/in/patrick-pataky', '_blank');
        } else if (cmd === ':github') {
            window.open('https://github.com/ppataky', '_blank');
        } else if (cmd === ':resume') {
            window.open('patrick-pataky.pdf', '_blank');
        } else if (cmd === ':help') {
            helpOverlay.style.display = 'block';
        } else if (cmd === ':q' || cmd === ':wq') {
            if (helpOverlay.style.display === 'block') {
                helpOverlay.style.display = 'none';
            } else {
                closeVim();
            }
        } else if (cmd === ':e portfolio.sv') {
            switchBuffer('buffer-portfolio', 'portfolio.sv');
        } else if (cmd === ':e github.txt') {
            switchBuffer('buffer-github', 'github.txt');
        } else if (cmd.startsWith(':')) {
            cmdInput.value = 'E492: Not an editor command: ' + cmd.substring(1);
            setTimeout(() => {
                if (document.activeElement !== cmdInput) cmdInput.value = '';
            }, 2000);
            return;
        }

        cmdInput.value = '';
        cmdInput.blur();
    }
});
