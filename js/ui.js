(() => {
    'use strict';

    const M = SULU;

    function escapeHtml(value) {
        return String(value ?? '').replace(
            /[&<>"']/g,
            character => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            })[character]
        );
    }

    function getGenderLabel(gender) {
        if (gender === 'male') {
            return 'Männlich';
        }

        if (gender === 'female') {
            return 'Weiblich';
        }

        return 'Unbekannt';
    }

    function getDisplayGender(uniformSet, settings) {
        const storedGender = uniformSet?.gender || 'unknown';

        if (!settings?.debugMode) {
            return storedGender;
        }

        if (settings.debugGenderOverride === 'male') {
            return 'male';
        }

        if (settings.debugGenderOverride === 'female') {
            return 'female';
        }

        return storedGender;
    }

    M.toast = (text, undoCallback) => {
        M.q('.tm-toast')?.remove();

        const toast = document.createElement('div');
        toast.className = 'tm-toast';
        toast.innerHTML = `
            <span>${escapeHtml(text)}</span>
            ${undoCallback
                ? '<button type="button">Rückgängig</button>'
                : ''
            }
        `;

        if (undoCallback) {
            toast
                .querySelector('button')
                ?.addEventListener('click', () => {
                    undoCallback();
                    toast.remove();
                });
        }

        document.body.append(toast);

        setTimeout(
            () => toast.remove(),
            undoCallback ? 7000 : 3000
        );
    };

    M.dress = (
        uniformSet,
        displayGender = uniformSet?.gender || 'unknown'
    ) => {
        const colors = uniformSet.colors;
        const isFemale = displayGender === 'female';

        const upperBody = isFemale
            ? `
                <g>
                    <path
                        fill="${escapeHtml(colors.shirt)}"
                        d="M54 15H70 Q80 23 90 15H106 V31 Q106 40 112 47 L117 52 V117 H43 V52 L48 47 Q54 40 54 31Z"
                    />
                    <path
                        fill="none"
                        d="M68 20 Q68 43 80 43 Q92 43 92 20"
                    />
                </g>
            `
            : `
                <g>
                    <path
                        fill="${escapeHtml(colors.shirt)}"
                        d="M47 24L63 14H97L113 24L132 40L120 58L113 53V117H47V53L40 58L28 40Z"
                    />
                    <path
                        fill="none"
                        d="M64 15L80 41L96 15"
                    />
                    <path
                        fill="none"
                        d="M72 15L80 28L88 15"
                    />
                </g>
            `;

        const lowerBody = isFemale
            ? `
                <g>
                    <path
                        fill="${escapeHtml(colors.bottom)}"
                        d="M43 124h74v17l20 61c-17 10-37 15-57 15s-40-5-57-15l20-61z"
                    />
                    <path fill="none" d="M43 141h74" />
                    <path
                        fill="none"
                        d="M57 156l-9 51M72 156l-3 59M88 156l3 59M103 156l9 51"
                    />
                </g>
            `
            : `
                <g>
                    <path
                        fill="${escapeHtml(colors.bottom)}"
                        d="M47 124H113V142L117 205H87L80 192L73 205H43L47 142Z"
                    />
                    <path
                        fill="none"
                        d="M47 133H113"
                    />
                    <path
                        fill="none"
                        d="M47 142H113"
                    />
                    <path
                        fill="none"
                        d="M70 151L68 173M90 151L92 173"
                    />
                </g>
            `;

        return `
            <svg
                viewBox="0 0 160 330"
                role="img"
                aria-label="${
                    isFemale
                        ? 'Trikotsatz mit Hockeyrock'
                        : 'Trikotsatz mit Hose'
                }"
            >
                <g
                    stroke="#050505"
                    stroke-width="5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    ${upperBody}
                    ${lowerBody}
                    <path
                        fill="${escapeHtml(colors.socks)}"
                        d="M47 231h27v61c0 13-6 20-19 20H28c-17 0-18-21-1-21h14c5 0 6-4 6-11zm39 0h27v49c0 7 1 11 6 11h14c17 0 16 21-1 21h-27c-13 0-19-7-19-20z"
                    />
                    <path
                        fill="none"
                        d="M47 247h27M47 261h27M86 247h27M86 261h27"
                    />
                </g>
            </svg>
        `;
    };

    function createColorBoxes(uniformSet, displayGender) {
        const bottomLabel =
            displayGender === 'female'
                ? 'Rock'
                : 'Hose';

        const colors = [
            ['Trikot', uniformSet.colors.shirt],
            [bottomLabel, uniformSet.colors.bottom],
            ['Stutzen', uniformSet.colors.socks],
            ['Torwart', uniformSet.colors.keeper]
        ];

        return `
            <div class="colors">
                ${colors.map(([name, color]) => `
                    <span>
                        <i style="background: ${escapeHtml(color)}"></i>
                        <em>${escapeHtml(name)}</em>
                        <code>${escapeHtml(color)}</code>
                    </span>
                `).join('')}
            </div>
        `;
    }

    function createGenderInformation(
        uniformSet,
        displayGender,
        settings
    ) {
        const storedGender = uniformSet.gender || 'unknown';
        const debugOverrideActive =
            settings?.debugMode &&
            (
                settings.debugGenderOverride === 'male' ||
                settings.debugGenderOverride === 'female'
            );

        if (debugOverrideActive) {
            return `
                <div class="tm-gender-info debug">
                    <strong>
                        Debug: ${escapeHtml(
                getGenderLabel(displayGender)
            )}
                    </strong>
                    <small>
                        Gespeichert: ${escapeHtml(
                getGenderLabel(storedGender)
            )}
                    </small>
                </div>
            `;
        }

        if (
            settings?.debugMode &&
            settings.debugGenderOverride === 'auto'
        ) {
            return `
                <div class="tm-gender-info automatic">
                    <strong>
                        Automatisch erkannt:
                        ${escapeHtml(getGenderLabel(storedGender))}
                    </strong>
                </div>
            `;
        }

        return `
            <div class="tm-gender-info">
                <span>
                    Team: ${escapeHtml(getGenderLabel(storedGender))}
                </span>
            </div>
        `;
    }

    function getSavedAtText(uniformSet) {
        const value =
            uniformSet.updatedAt ||
            uniformSet.createdAt ||
            uniformSet.savedAt;

        if (!value) {
            return 'Speicherzeit unbekannt';
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return 'Speicherzeit unbekannt';
        }

        const formattedDate = new Intl.DateTimeFormat(
            'de-DE',
            {
                dateStyle: 'medium',
                timeStyle: 'short'
            }
        ).format(date);

        return `Gespeichert: ${formattedDate}`;
    }

    function createModal(title, body, wide = true) {
        M.q('.tm-bg')?.remove();

        const modalBackground = document.createElement('div');
        modalBackground.className = 'tm-bg';
        modalBackground.innerHTML = `
            <div class="tm-modal ${wide ? '' : 'small'}">
                <header>
                    <small>SULU Trikot-Manager 1.2</small>
                    <h2>${escapeHtml(title)}</h2>
                    <button
                        type="button"
                        class="x"
                        aria-label="Fenster schließen"
                    >
                        ×
                    </button>
                </header>
                <main>${body}</main>
                <aside class="tm-legal">
                    <span>
                        © 2026 Lars Hansen · Alle Rechte vorbehalten.
                    </span>
                    <span>
                        Jegliche Veränderung untersagt. Weitergabe nur mit
                        ausdrücklicher Genehmigung durch den Entwickler.
                    </span>
                </aside>
            </div>
        `;

        modalBackground.addEventListener('click', event => {
            if (
                event.target === modalBackground ||
                event.target.closest('.x')
            ) {
                modalBackground.remove();
            }
        });

        document.body.append(modalBackground);

        return modalBackground;
    }

    function createCards(uniformSets, settings, target) {
        return uniformSets.map(uniformSet => {
            const displayGender = getDisplayGender(
                uniformSet,
                settings
            );

            const storedDate =
                uniformSet.updatedAt ||
                uniformSet.createdAt ||
                uniformSet.savedAt ||
                '';

            return `
                <article data-id="${escapeHtml(uniformSet.id)}">
                    ${M.dress(uniformSet, displayGender)}
                    <section>
                        <b>${escapeHtml(uniformSet.title)}</b>
                        ${createGenderInformation(
                uniformSet,
                displayGender,
                settings
            )}
                        ${createColorBoxes(
                uniformSet,
                displayGender
            )}
                    </section>
                    <footer>
                        <time datetime="${escapeHtml(storedDate)}">
                            ${escapeHtml(getSavedAtText(uniformSet))}
                        </time>
                        <div class="card-actions">
                            ${target
                    ? `
                                        <button
                                            type="button"
                                            class="use"
                                        >
                                            Übernehmen
                                        </button>
                                    `
                    : `
                                        <button
                                            type="button"
                                            class="edit"
                                        >
                                            Bearbeiten
                                        </button>
                                        <button
                                            type="button"
                                            class="del"
                                        >
                                            Löschen
                                        </button>
                                    `
                }
                        </div>
                    </footer>
                </article>
            `;
        }).join('');
    }

    M.show = async target => {
        let uniformSets = await M.store.get();
        let activeModal = null;

        const render = async () => {
            const settings = await M.store.getSettings();
            const cards = createCards(
                uniformSets,
                settings,
                target
            );

            activeModal?.remove();

            activeModal = createModal(
                'Gespeicherte Trikotsätze',
                `
                    <div class="toolbar simple">
                        <button
                            type="button"
                            class="export"
                        >
                            Export
                        </button>
                        <button
                            type="button"
                            class="import"
                        >
                            Import
                        </button>
                        <input
                            class="file"
                            type="file"
                            accept="application/json"
                            hidden
                        >
                    </div>
                    <div class="cards">
                        ${cards ||
                '<p>Keine Trikotsätze gespeichert.</p>'
                }
                    </div>
                `
            );

            const main = activeModal.querySelector('main');
            const exportButton = main.querySelector('.export');
            const importButton = main.querySelector('.import');
            const fileInput = main.querySelector('.file');

            exportButton.addEventListener('click', () => {
                const exportContent = M.store.exportData(
                    uniformSets
                );

                const blob = new Blob(
                    [exportContent],
                    { type: 'application/json' }
                );

                const downloadUrl = URL.createObjectURL(blob);
                const downloadLink = document.createElement('a');

                downloadLink.href = downloadUrl;
                downloadLink.download = 'SULU-Trikotsaetze.json';
                downloadLink.click();

                URL.revokeObjectURL(downloadUrl);
            });

            importButton.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', async () => {
                const selectedFile = fileInput.files?.[0];

                if (!selectedFile) {
                    return;
                }

                try {
                    const fileContent = await selectedFile.text();
                    const importedData = JSON.parse(fileContent);

                    await M.store.importData(
                        importedData,
                        'overwrite'
                    );

                    uniformSets = await M.store.get();
                    await render();
                    M.toast('Import abgeschlossen.');
                } catch (error) {
                    M.toast(
                        error?.message ||
                        'Import fehlgeschlagen.'
                    );
                }
            });

            main
                .querySelectorAll('article')
                .forEach(card => {
                    const id = card.dataset.id;
                    const uniformSet = uniformSets.find(
                        item => item.id === id
                    );

                    if (!uniformSet) {
                        return;
                    }

                    card
                        .querySelector('.use')
                        ?.addEventListener('click', () => {
                            activeModal.remove();
                            M.apply(target, uniformSet);
                        });

                    card
                        .querySelector('.del')
                        ?.addEventListener('click', async () => {
                            const deleted = await M.store.del(id);

                            if (!deleted) {
                                return;
                            }

                            uniformSets = await M.store.get();
                            await render();
                        });

                    card
                        .querySelector('.edit')
                        ?.addEventListener('click', () => {
                            M.edit(
                                uniformSet,
                                async changes => {
                                    await M.store.patch(
                                        id,
                                        changes
                                    );

                                    uniformSets = await M.store.get();
                                    await render();
                                }
                            );
                        });
                });
        };

        await render();
    };

    M.edit = (uniformSet, done) => {
        const colorFields = [
            ['shirt', 'Trikot'],
            ['bottom', 'Rock/Hose'],
            ['socks', 'Stutzen'],
            ['keeper', 'Torwart']
        ];

        const modal = createModal(
            'Trikotsatz bearbeiten',
            `
                <form class="editor">
                    <label>
                        Name
                        <input
                            name="title"
                            value="${escapeHtml(uniformSet.title)}"
                            required
                        >
                    </label>
                    ${colorFields.map(([key, name]) => `
                        <label class="color-editor">
                            <span>${escapeHtml(name)}</span>
                            <div class="color-editor-row">
                                <input
                                    class="color-picker"
                                    type="color"
                                    value="${escapeHtml(
                uniformSet.colors[key]
            )}"
                                    aria-label="${escapeHtml(name)} auswählen"
                                >
                                <input
                                    class="color-hex"
                                    name="${escapeHtml(key)}"
                                    value="${escapeHtml(
                uniformSet.colors[key]
            )}"
                                    pattern="#[0-9A-Fa-f]{6}"
                                    maxlength="7"
                                    required
                                >
                            </div>
                        </label>
                    `).join('')}
                    <button type="submit">Speichern</button>
                </form>
            `,
            false
        );

        const form = modal.querySelector('form');

        form
            .querySelectorAll('.color-editor')
            .forEach(row => {
                const colorPicker = row.querySelector(
                    '.color-picker'
                );
                const hexInput = row.querySelector('.color-hex');

                const validateAndSynchronize = value => {
                    const normalizedColor = M.n(value);

                    if (M.hex(normalizedColor)) {
                        colorPicker.value = normalizedColor;
                        hexInput.setCustomValidity('');
                    } else {
                        hexInput.setCustomValidity(
                            'Hexwert im Format #RRGGBB eingeben.'
                        );
                    }
                };

                colorPicker.addEventListener('input', () => {
                    hexInput.value = colorPicker.value.toUpperCase();
                    validateAndSynchronize(hexInput.value);
                });

                hexInput.addEventListener('input', () => {
                    validateAndSynchronize(hexInput.value);
                });

                hexInput.addEventListener('blur', () => {
                    if (M.hex(hexInput.value)) {
                        hexInput.value = hexInput.value.toUpperCase();
                    }
                });

                validateAndSynchronize(hexInput.value);
            });

        form.addEventListener('submit', async event => {
            event.preventDefault();

            const formData = new FormData(form);
            const colors = {
                shirt: formData.get('shirt'),
                bottom: formData.get('bottom'),
                socks: formData.get('socks'),
                keeper: formData.get('keeper')
            };

            if (!Object.values(colors).every(M.hex)) {
                M.toast('Bitte gültige Hexwerte eingeben.');
                return;
            }

            await done({
                title: M.n(formData.get('title')),
                colors
            });

            modal.remove();
        });
    };

    M.count = async () => {
        const overviewButton = M.q('.tm-overview');

        if (!overviewButton) {
            return;
        }

        const uniformSets = await M.store.get();

        if (!M.store.isContextValid()) {
            return;
        }

        overviewButton.textContent =
            `Gespeicherte Trikotsätze (${uniformSets.length})`;

        overviewButton.classList.toggle(
            'has',
            uniformSets.length > 0
        );
    };
})();