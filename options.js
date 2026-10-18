(() => {
    'use strict';

    const api = globalThis.browser || globalThis.chrome;
    const SETTINGS_KEY = 'suluSettings';

    const DEFAULT_SETTINGS = {
        debugMode: false,
        debugGenderOverride: 'auto',
        effectsEnabled: true,
        lastDetectedGender: 'unknown'
    };

    const debugModeInput = document.getElementById('debugMode');
    const debugSettings = document.getElementById('debugSettings');
    const uniformPreview = document.getElementById('uniformPreview');
    const statusBadge = document.getElementById('statusBadge');
    const statusDescription = document.getElementById('statusDescription');
    const bottomLabel = document.getElementById('bottomLabel');
    const saveStatus = document.getElementById('saveStatus');

    let settings = { ...DEFAULT_SETTINGS };
    let saveStatusTimer = null;

    function normalizeSettings(value = {}) {
        const validOverrides = ['auto', 'male', 'female'];
        const validGenders = ['male', 'female', 'unknown'];

        return {
            debugMode:
                typeof value.debugMode === 'boolean'
                    ? value.debugMode
                    : DEFAULT_SETTINGS.debugMode,

            debugGenderOverride:
                validOverrides.includes(value.debugGenderOverride)
                    ? value.debugGenderOverride
                    : DEFAULT_SETTINGS.debugGenderOverride,

            effectsEnabled:
                typeof value.effectsEnabled === 'boolean'
                    ? value.effectsEnabled
                    : DEFAULT_SETTINGS.effectsEnabled,

            lastDetectedGender:
                validGenders.includes(value.lastDetectedGender)
                    ? value.lastDetectedGender
                    : DEFAULT_SETTINGS.lastDetectedGender
        };
    }

    function getSelectedGenderOverride() {
        return document.querySelector(
            'input[name="genderOverride"]:checked'
        )?.value || 'auto';
    }

    function applySettingsToForm() {
        if (debugModeInput) {
            debugModeInput.checked = settings.debugMode;
        }

        const selectedGenderInput = document.querySelector(
            `input[name="genderOverride"][value="${settings.debugGenderOverride}"]`
        );

        if (selectedGenderInput) {
            selectedGenderInput.checked = true;
        }
    }

    async function loadSettings() {
        const result = await api.storage.local.get(SETTINGS_KEY);

        settings = normalizeSettings({
            ...DEFAULT_SETTINGS,
            ...(result[SETTINGS_KEY] || {})
        });

        applySettingsToForm();
        updatePage();
    }

    async function saveSettings() {
        settings = normalizeSettings({
            ...settings,
            debugMode: Boolean(debugModeInput?.checked),
            debugGenderOverride: getSelectedGenderOverride()
        });

        await api.storage.local.set({
            [SETTINGS_KEY]: settings
        });

        updatePage();
        showSaveStatus();
    }

    function getEffectiveGender() {
        if (
            settings.debugMode &&
            settings.debugGenderOverride === 'male'
        ) {
            return 'male';
        }

        if (
            settings.debugMode &&
            settings.debugGenderOverride === 'female'
        ) {
            return 'female';
        }

        return settings.lastDetectedGender;
    }

    function genderText(gender) {
        if (gender === 'male') {
            return 'Männlich';
        }

        if (gender === 'female') {
            return 'Weiblich';
        }

        return 'Unbekannt';
    }

    function updatePage() {
        const effectiveGender = getEffectiveGender();
        const detectedGender = settings.lastDetectedGender;

        debugSettings?.classList.toggle(
            'disabled',
            !settings.debugMode
        );

        if (statusBadge) {
            statusBadge.classList.toggle(
                'inactive',
                !settings.debugMode
            );

            if (!settings.debugMode) {
                statusBadge.textContent = 'Debug-Modus deaktiviert';
            } else if (settings.debugGenderOverride === 'auto') {
                statusBadge.textContent =
                    effectiveGender === 'unknown'
                        ? 'Automatische Erkennung'
                        : `Automatisch: ${genderText(effectiveGender)}`;
            } else {
                statusBadge.textContent =
                    `Debug-Override: ${genderText(effectiveGender)}`;
            }
        }

        if (statusDescription) {
            if (!settings.debugMode) {
                statusDescription.textContent =
                    detectedGender === 'unknown'
                        ? 'Es wurde noch kein Teamgeschlecht auf hockey.de erkannt.'
                        : `Zuletzt automatisch erkannt: ${genderText(detectedGender)}.`;
            } else if (settings.debugGenderOverride === 'auto') {
                statusDescription.textContent =
                    effectiveGender === 'unknown'
                        ? 'Öffne eine Trikotseite auf hockey.de, damit das Teamgeschlecht erkannt werden kann.'
                        : `Das Team wurde tatsächlich als ${genderText(effectiveGender).toLowerCase()} erkannt.`;
            } else {
                statusDescription.textContent =
                    effectiveGender === 'male'
                        ? 'Die männliche Darstellung mit Hose wird erzwungen.'
                        : 'Die weibliche Darstellung mit Hockeyrock wird erzwungen.';
            }
        }

        if (bottomLabel) {
            bottomLabel.textContent =
                effectiveGender === 'female'
                    ? 'Hockeyrock'
                    : 'Hose';
        }

        if (uniformPreview) {
            uniformPreview.innerHTML = createUniformSvg(
                effectiveGender
            );
        }
    }

    function showSaveStatus() {
        if (!saveStatus) {
            return;
        }

        saveStatus.textContent = 'Einstellungen gespeichert.';
        clearTimeout(saveStatusTimer);

        saveStatusTimer = setTimeout(() => {
            saveStatus.textContent = '';
        }, 1600);
    }

    function createUniformSvg(gender) {
        const isFemale = gender === 'female';

        const lowerBody = isFemale
            ? `
                <g>
                    <path
                        fill="#202a44"
                        d="M43 124h74v17l20 61c-17 10-37 15-57 15s-40-5-57-15l20-61z"
                    />
                    <path
                        fill="none"
                        d="M43 141h74"
                    />
                    <path
                        fill="none"
                        d="M57 156l-9 51M72 156l-3 59M88 156l3 59M103 156l9 51"
                    />
                </g>
            `
            : `
                <g>
                    <path
                        fill="#202a44"
                        d="M43 124H117V142H43Z"
                    />
                    <path
                        fill="#202a44"
                        d="M47 142H113L121 207H91L80 190L69 207H39Z"
                    />
                    <path
                        fill="none"
                        d="M43 132H117M47 142H113"
                    />
                    <path
                        fill="none"
                        d="M70 151L67 171M90 151L93 171"
                    />
                </g>
            `;

        return `
            <svg
                viewBox="0 0 160 330"
                role="img"
                aria-label="${
                    isFemale
                        ? 'Weiblicher Trikotsatz mit Hockeyrock'
                        : 'Männlicher Trikotsatz mit Hockeyhose'
                }"
            >
                <g
                    stroke="#050505"
                    stroke-width="5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <path
                        fill="#d71920"
                        d="M54 15H70 Q80 23 90 15H106 V31 Q106 40 112 47 L117 52 V117 H43 V52 L48 47 Q54 40 54 31Z"
                    />
                    <path
                        fill="none"
                        d="M68 20 Q68 43 80 43 Q92 43 92 20"
                    />
                    ${lowerBody}
                    <path
                        fill="#ffffff"
                        d="M47 231h27v61c0 13-6 20-19 20H28c-17 0-18-21-1-21h14c5 0 6-4 6-11zm39 0h27v49c0 7 1 11 6 11h14c17 0 16 21-1 21h-27c-13 0-19-7-19-20z"
                    />
                    <path
                        fill="none"
                        d="M47 247h27M47 261h27M86 247h27M86 261h27"
                    />
                </g>
            </svg>
        `;
    }

    debugModeInput?.addEventListener(
        'change',
        saveSettings
    );

    document
        .querySelectorAll('input[name="genderOverride"]')
        .forEach(input => {
            input.addEventListener(
                'change',
                saveSettings
            );
        });

    api.storage.onChanged.addListener(
        (changes, areaName) => {
            if (
                areaName !== 'local' ||
                !changes[SETTINGS_KEY]
            ) {
                return;
            }

            settings = normalizeSettings({
                ...DEFAULT_SETTINGS,
                ...(changes[SETTINGS_KEY].newValue || {})
            });

            applySettingsToForm();
            updatePage();
        }
    );

    void loadSettings();
})();
