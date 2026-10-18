(() => {
    'use strict';

    const M = SULU;
    const SCHEMA_VERSION = 2;
    const SETTINGS_KEY = 'suluSettings';

    const DEFAULT_SETTINGS = {
        debugMode: false,
        debugGenderOverride: 'auto',
        effectsEnabled: true,
        lastDetectedGender: 'unknown'
    };

    const VALID_GENDERS = new Set([
        'male',
        'female',
        'unknown'
    ]);

    const VALID_GENDER_OVERRIDES = new Set([
        'auto',
        'male',
        'female'
    ]);

    let contextWarningShown = false;

    function now() {
        return new Date().toISOString();
    }

    function isContextValid() {
        try {
            return Boolean(M.api?.runtime?.id);
        } catch {
            return false;
        }
    }

    function warnContext() {
        if (contextWarningShown) {
            return;
        }

        contextWarningShown = true;

        M.toast?.(
            'Die Erweiterung wurde aktualisiert. Bitte diese hockey.de-Seite neu laden.'
        );
    }

    async function safe(callback, fallback) {
        if (!isContextValid()) {
            warnContext();
            return fallback;
        }

        try {
            return await callback();
        } catch (error) {
            const message = String(error?.message || error);

            if (message.includes('Extension context invalidated')) {
                warnContext();
            } else {
                console.error('SULU Trikot-Manager', error);
                M.toast?.(
                    'Lokale Daten konnten nicht verarbeitet werden.'
                );
            }

            return fallback;
        }
    }

    function normalizeText(value, fallback = '') {
        const normalized = String(value ?? '')
            .replace(/\s+/g, ' ')
            .trim();

        return normalized || fallback;
    }

    function normalizeGender(value) {
        return VALID_GENDERS.has(value)
            ? value
            : 'unknown';
    }

    function normalizeGenderOverride(value) {
        return VALID_GENDER_OVERRIDES.has(value)
            ? value
            : 'auto';
    }

    function migrate(item = {}) {
        const timestamp = now();
        const createdAt =
            item.createdAt ||
            item.savedAt ||
            timestamp;

        return {
            id: item.id || crypto.randomUUID(),
            schemaVersion: SCHEMA_VERSION,
            title: normalizeText(
                item.title,
                'Unbenannter Trikotsatz'
            ),
            colors: {
                shirt: normalizeText(item.colors?.shirt),
                bottom: normalizeText(item.colors?.bottom),
                socks: normalizeText(item.colors?.socks),
                keeper: normalizeText(item.colors?.keeper)
            },
            gender: normalizeGender(item.gender),
            standard: Boolean(item.standard),
            alternative: Boolean(item.alternative),
            createdAt,
            updatedAt:
                item.updatedAt ||
                item.savedAt ||
                createdAt,
            sourceTeamId:
                item.sourceTeamId !== undefined &&
                item.sourceTeamId !== null &&
                item.sourceTeamId !== ''
                    ? String(item.sourceTeamId)
                    : null
        };
    }

    async function getAll() {
        const data = await safe(
            async () => {
                const result = await M.api.storage.local.get(M.K);
                return result[M.K] || [];
            },
            []
        );

        if (!Array.isArray(data)) {
            return [];
        }

        return data.map(migrate);
    }

    async function write(items) {
        const normalizedItems = Array.isArray(items)
            ? items.map(migrate)
            : [];

        return safe(
            async () => {
                await M.api.storage.local.set({
                    [M.K]: normalizedItems
                });

                return true;
            },
            false
        );
    }

    async function save(item = {}) {
        const items = await getAll();
        const title = normalizeText(
            item.title,
            'Unbenannter Trikotsatz'
        );

        const index = items.findIndex(
            existingItem =>
                existingItem.title.toLocaleLowerCase('de-DE') ===
                title.toLocaleLowerCase('de-DE')
        );

        const timestamp = now();
        let preparedItem = migrate({
            ...item,
            title,
            updatedAt: timestamp
        });

        if (index >= 0) {
            const confirmed = confirm(
                `„${preparedItem.title}“ überschreiben?`
            );

            if (!confirmed) {
                return false;
            }

            preparedItem = {
                ...preparedItem,
                id: items[index].id,
                createdAt: items[index].createdAt,
                updatedAt: timestamp
            };

            items[index] = preparedItem;
        } else {
            items.push(preparedItem);
        }

        return write(items);
    }

    async function remove(id) {
        const items = await getAll();
        const item = items.find(
            existingItem => existingItem.id === id
        );

        if (!item) {
            return false;
        }

        const confirmed = confirm(
            `„${item.title}“ löschen?`
        );

        if (!confirmed) {
            return false;
        }

        return write(
            items.filter(
                existingItem => existingItem.id !== id
            )
        );
    }

    async function patch(id, changes = {}) {
        const items = await getAll();
        const index = items.findIndex(
            item => item.id === id
        );

        if (index < 0) {
            return false;
        }

        const existingItem = items[index];

        items[index] = migrate({
            ...existingItem,
            ...changes,
            colors: {
                ...existingItem.colors,
                ...(changes.colors || {})
            },
            id: existingItem.id,
            createdAt: existingItem.createdAt,
            updatedAt: now()
        });

        return write(items);
    }

    function normalizeSettings(settings = {}) {
        return {
            debugMode:
                typeof settings.debugMode === 'boolean'
                    ? settings.debugMode
                    : DEFAULT_SETTINGS.debugMode,
            debugGenderOverride: normalizeGenderOverride(
                settings.debugGenderOverride
            ),
            effectsEnabled:
                typeof settings.effectsEnabled === 'boolean'
                    ? settings.effectsEnabled
                    : DEFAULT_SETTINGS.effectsEnabled,
            lastDetectedGender: normalizeGender(
                settings.lastDetectedGender
            )
        };
    }

    async function getSettings() {
        const storedSettings = await safe(
            async () => {
                const result = await M.api.storage.local.get(
                    SETTINGS_KEY
                );

                return result[SETTINGS_KEY] || {};
            },
            {}
        );

        return normalizeSettings({
            ...DEFAULT_SETTINGS,
            ...storedSettings
        });
    }

    async function updateSettings(changes = {}) {
        const currentSettings = await getSettings();
        const updatedSettings = normalizeSettings({
            ...currentSettings,
            ...changes
        });

        const success = await safe(
            async () => {
                await M.api.storage.local.set({
                    [SETTINGS_KEY]: updatedSettings
                });

                return true;
            },
            false
        );

        return success
            ? updatedSettings
            : currentSettings;
    }

    async function resetSettings() {
        const defaultSettings = normalizeSettings(
            DEFAULT_SETTINGS
        );

        const success = await safe(
            async () => {
                await M.api.storage.local.set({
                    [SETTINGS_KEY]: defaultSettings
                });

                return true;
            },
            false
        );

        return success
            ? defaultSettings
            : getSettings();
    }

    function exportData(items) {
        const uniformSets = Array.isArray(items)
            ? items.map(migrate)
            : [];

        return JSON.stringify(
            {
                application: 'SULU Trikot-Manager',
                formatVersion: SCHEMA_VERSION,
                exportedAt: now(),
                uniformSets
            },
            null,
            2
        );
    }

    async function importData(payload, mode = 'merge') {
        if (
            payload?.application !== 'SULU Trikot-Manager' ||
            !Array.isArray(payload.uniformSets)
        ) {
            throw new Error('Ungültige Sicherungsdatei.');
        }

        const validModes = new Set([
            'merge',
            'overwrite',
            'replace'
        ]);

        const importMode = validModes.has(mode)
            ? mode
            : 'merge';

        const importedAt = now();
        const currentItems = importMode === 'replace'
            ? []
            : await getAll();

        const itemsByTitle = new Map(
            currentItems.map(item => [
                item.title.toLocaleLowerCase('de-DE'),
                item
            ])
        );

        for (const rawItem of payload.uniformSets) {
            const importedItem = migrate({
                ...rawItem,
                createdAt: importedAt,
                updatedAt: importedAt,
                savedAt: importedAt
            });

            importedItem.createdAt = importedAt;
            importedItem.updatedAt = importedAt;

            const titleKey = importedItem.title
                .toLocaleLowerCase('de-DE');

            const alreadyExists = itemsByTitle.has(titleKey);

            if (
                !alreadyExists ||
                importMode === 'overwrite' ||
                importMode === 'replace'
            ) {
                itemsByTitle.set(
                    titleKey,
                    importedItem
                );
            }
        }

        return write([...itemsByTitle.values()]);
    }

    M.store = {
        get: getAll,
        save,
        del: remove,
        patch,
        exportData,
        importData,
        getSettings,
        updateSettings,
        resetSettings,
        isContextValid,
        migrate
    };
})();