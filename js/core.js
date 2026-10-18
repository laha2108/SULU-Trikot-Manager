(() => {

    'use strict';

    const M = window.SULU = window.SULU || {};
    const A = globalThis.browser || globalThis.chrome;

    M.api = A;
    M.K = 'hockeyUniformSetsV3';

    M.q = (selector, root = document) =>
        root?.querySelector(selector);

    M.qa = (selector, root = document) =>
        [...(root?.querySelectorAll(selector) || [])];

    M.n = (value) =>
        String(value || '')
            .replace(/\s+/g, ' ')
            .trim();

    M.hex = (value) =>
        /^#[0-9a-f]{6}$/i.test(M.n(value));

    M.visible = (element) => {

        if (!element?.isConnected) {
            return false;
        }

        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);

        return (
            rect.width > 0 &&
            rect.height > 0 &&
            style.display !== 'none' &&
            style.visibility !== 'hidden'
        );
    };

    M.label = (root, text) =>
        M.qa('label,span,div,p', root).find(element =>
            element.children.length === 0 &&
            M.visible(element) &&
            M.n(element.textContent).toLowerCase() === text
        );

    M.fields = new WeakMap();

    M.getFields = (root) => {

        let cached = M.fields.get(root);

        if (
            cached &&
            Object.values(cached).every(
                element => !element || element.isConnected
            )
        ) {
            return cached;
        }

        const inputs = M.qa('input', root)
            .filter(element =>
                M.visible(element) &&
                ![
                    'checkbox',
                    'radio',
                    'hidden',
                    'button',
                    'submit'
                ].includes(element.type)
            );

        const getField = (labelText) => {

            const label = M.label(root, labelText);

            if (!label) {
                return null;
            }

            const labelRect = label.getBoundingClientRect();

            let best = null;
            let distance = Number.MAX_SAFE_INTEGER;

            for (const input of inputs) {

                const inputRect =
                    input.getBoundingClientRect();

                if (inputRect.top < labelRect.bottom - 3) {
                    continue;
                }

                const score =
                    (inputRect.top - labelRect.bottom) * 10 +
                    Math.abs(inputRect.left - labelRect.left);

                if (score < distance) {
                    distance = score;
                    best = input;
                }
            }

            return best;
        };

        cached = {

            name:
                getField('name'),

            shirt:
                getField('trikot'),

            bottom:
                getField('hose / rock'),

            socks:
                getField('stutzen'),

            keeper:
                getField('torwart')
        };

        M.fields.set(root, cached);

        return cached;
    };

    M.blocks = () => {

        const candidates = M.qa(
            'form,fieldset,section,article,div'
        ).filter(element =>
            M.visible(element) &&
            [
                'name',
                'standard-trikots',
                'alternativ-trikots',
                'trikot',
                'hose / rock',
                'stutzen',
                'torwart'
            ].every(keyword =>
                M.n(element.innerText)
                    .toLowerCase()
                    .includes(keyword)
            )
        );

        return candidates.filter(
            candidate =>
                !candidates.some(
                    other =>
                        other !== candidate &&
                        candidate.contains(other)
                )
        );
    };

    M.set = (element, value) => {

        if (!element) {
            return;
        }

        const descriptor =
            Object.getOwnPropertyDescriptor(
                element.constructor.prototype,
                'value'
            );

        if (descriptor?.set) {
            descriptor.set.call(element, value);
        } else {
            element.value = value;
        }

        ['input', 'change', 'blur']
            .forEach(eventName =>
                element.dispatchEvent(
                    new Event(eventName, {
                        bubbles: true
                    })
                )
            );
    };

    M.onPage = () =>
        /\/tm-dhbteam\/de\/\d+\/uniforms/.test(
            location.hash
        );

})();