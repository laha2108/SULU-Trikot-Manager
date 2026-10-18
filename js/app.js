(() => {
  'use strict';

  const M = SULU;

  const decoratedBlocks = new WeakSet();

  let undoState = null;
  let refreshTimer = null;

  /**
   * Ermittelt das Geschlecht anhand der hockey.de-Seite.
   *
   * Rückgabewerte:
   * - male
   * - female
   * - unknown
   */
  function detectTeamGender() {
    const pageText = M.n(
      document.body.innerText
    );

    const malePattern =
      /männlich|maennlich|herren|\bmu\s*-?\s*\d+/i;

    const femalePattern =
      /weiblich|damen|mädchen|maedchen|\bwu\s*-?\s*\d+/i;

    const isMale =
      malePattern.test(pageText);

    const isFemale =
      femalePattern.test(pageText);

    /*
     * Eindeutig männlich erkannt.
     */
    if (isMale && !isFemale) {
      return 'male';
    }

    /*
     * Eindeutig weiblich erkannt.
     */
    if (isFemale && !isMale) {
      return 'female';
    }

    /*
     * Fallback auf die bisherige Erkennungslogik.
     *
     * Dadurch bleibt das bisherige Verhalten erhalten,
     * falls weibliche Schlüsselbegriffe auf der Seite fehlen.
     */
    if (isMale) {
      return 'male';
    }

    /*
     * Die bisherige Logik behandelte alle Seiten ohne
     * männlichen Treffer als weiblich.
     */
    return 'female';
  }

  /**
   * Liefert das Geschlecht, das tatsächlich verwendet werden soll.
   *
   * Bei deaktiviertem Debug-Modus:
   * automatische Erkennung
   *
   * Debug + auto:
   * automatische Erkennung
   *
   * Debug + male:
   * männliche Darstellung erzwingen
   *
   * Debug + female:
   * weibliche Darstellung erzwingen
   */
  async function getEffectiveTeamGender() {
    const detectedGender =
      detectTeamGender();

    const settings =
      await M.store.getSettings();

    /*
     * Die tatsächliche automatische Erkennung wird unabhängig
     * vom Debug-Override gespeichert.
     *
     * Dadurch kann options.html anzeigen, was hockey.de
     * tatsächlich erkannt hat.
     */
    if (
      detectedGender !== 'unknown' &&
      settings.lastDetectedGender !== detectedGender
    ) {
      await M.store.updateSettings({
        lastDetectedGender: detectedGender
      });
    }

    /*
     * Ohne Debug-Modus zählt immer die automatische Erkennung.
     */
    if (!settings.debugMode) {
      return {
        effectiveGender: detectedGender,
        detectedGender,
        debugMode: false,
        debugGenderOverride: 'auto'
      };
    }

    /*
     * Männliche Darstellung wird erzwungen.
     */
    if (
      settings.debugGenderOverride === 'male'
    ) {
      return {
        effectiveGender: 'male',
        detectedGender,
        debugMode: true,
        debugGenderOverride: 'male'
      };
    }

    /*
     * Weibliche Darstellung wird erzwungen.
     */
    if (
      settings.debugGenderOverride === 'female'
    ) {
      return {
        effectiveGender: 'female',
        detectedGender,
        debugMode: true,
        debugGenderOverride: 'female'
      };
    }

    /*
     * Debug-Modus ist aktiv, aber die Einstellung steht
     * auf automatischer Erkennung.
     */
    return {
      effectiveGender: detectedGender,
      detectedGender,
      debugMode: true,
      debugGenderOverride: 'auto'
    };
  }

  /**
   * Gibt den verständlichen deutschen Namen eines Geschlechts zurück.
   */
  function getGenderLabel(gender) {
    if (gender === 'male') {
      return 'männlich';
    }

    if (gender === 'female') {
      return 'weiblich';
    }

    return 'unbekannt';
  }

  /**
   * Übernimmt einen gespeicherten Trikotsatz in das hockey.de-Formular.
   */
  M.apply = async (root, uniformSet) => {
    const fields =
      M.getFields(root);

    undoState = {
      root,
      values: {
        name: fields.name?.value,
        shirt: fields.shirt?.value,
        bottom: fields.bottom?.value,
        socks: fields.socks?.value,
        keeper: fields.keeper?.value
      }
    };

    const valuesToApply = [
      [
        fields.name,
        uniformSet.title
      ],
      [
        fields.shirt,
        uniformSet.colors.shirt
      ],
      [
        fields.bottom,
        uniformSet.colors.bottom
      ],
      [
        fields.socks,
        uniformSet.colors.socks
      ],
      [
        fields.keeper,
        uniformSet.colors.keeper
      ]
    ];

    valuesToApply.forEach(
      ([element, value], index) => {
        M.set(element, value);

        setTimeout(() => {
          element?.classList.add('flash');
        }, index * 60);

        setTimeout(() => {
          element?.classList.remove('flash');
        }, 600 + index * 60);
      }
    );

    root.classList.add('applied');

    setTimeout(() => {
      root.classList.remove('applied');
    }, 900);

    M.toast(
      'Trikotsatz übernommen. Jetzt speichern.',
      () => {
        const previousState =
          undoState;

        if (!previousState) {
          return;
        }

        const previousFields =
          M.getFields(
            previousState.root
          );

        Object.entries(
          previousState.values
        ).forEach(
          ([key, value]) => {
            M.set(
              previousFields[key],
              value
            );
          }
        );

        M.toast(
          'Übernahme rückgängig gemacht.'
        );

        undoState = null;
      }
    );
  };

  /**
   * Ermittelt den Bearbeitungsstatus eines Trikotformulars.
   */
  function getStatus(root) {
    const fields =
      M.getFields(root);

    const values = [
      fields.shirt,
      fields.bottom,
      fields.socks,
      fields.keeper
    ].map(
      element =>
        M.n(element?.value)
    );

    const validValues =
      values.map(M.hex);

    const filledValues =
      values.map(Boolean);

    if (
      validValues.every(Boolean)
    ) {
      return 'complete';
    }

    if (
      filledValues.every(
        value => !value
      )
    ) {
      return 'empty';
    }

    return 'partial';
  }

  /**
   * Speichert einen Trikotsatz.
   */
  async function saveUniformSet(root) {
    const fields =
      M.getFields(root);

    const genderState =
      await getEffectiveTeamGender();

    const uniformSet = {
      id:
        crypto.randomUUID(),

      schemaVersion:
        2,

      title:
        M.n(fields.name?.value) ||
        'Unbenannter Trikotsatz',

      colors: {
        shirt:
          M.n(fields.shirt?.value),

        bottom:
          M.n(fields.bottom?.value),

        socks:
          M.n(fields.socks?.value),

        keeper:
          M.n(fields.keeper?.value)
      },

      /*
       * Hier wird das effektiv verwendete Geschlecht gespeichert.
       *
       * Beispiel:
       * Automatisch erkannt: female
       * Debug-Override: male
       * Gespeichert wird: male
       */
      gender:
        genderState.effectiveGender,

      sourceTeamId:
        (
          location.hash.match(
            /\/de\/(\d+)\//
          ) || []
        )[1] || null
    };

    const saved =
      await M.store.save(
        uniformSet
      );

    if (!saved) {
      return;
    }

    root.classList.add('saved');

    setTimeout(() => {
      root.classList.remove('saved');
    }, 700);

    if (
      genderState.debugMode &&
      genderState.debugGenderOverride !== 'auto'
    ) {
      M.toast(
        `Trikotwerte gespeichert. Debug-Darstellung: ${getGenderLabel(
          genderState.effectiveGender
        )
        }.`
      );

      return;
    }

    M.toast(
      `Trikotwerte gespeichert. Team erkannt: ${getGenderLabel(
        genderState.detectedGender
      )
      }.`
    );
  }

  /**
   * Fügt die SULU-Aktionen an ein hockey.de-Trikotformular an.
   */
  function decorate(root) {
    if (
      decoratedBlocks.has(root)
    ) {
      return;
    }

    decoratedBlocks.add(root);

    const actions =
      document.createElement('div');

    actions.className =
      'tm-actions';

    actions.innerHTML = `
            <span></span>

            <button
                type="button"
                class="save"
            >
                Trikotwerte speichern
            </button>

            <button
                type="button"
                class="get"
            >
                Trikotsatz abrufen
            </button>
        `;

    const statusText =
      actions.querySelector('span');

    const saveButton =
      actions.querySelector('.save');

    const getButton =
      actions.querySelector('.get');

    const update = () => {
      const currentStatus =
        getStatus(root);

      saveButton.hidden =
        currentStatus !== 'complete';

      getButton.hidden =
        currentStatus !== 'empty';

      if (
        currentStatus === 'partial'
      ) {
        statusText.textContent =
          'Trikotwerte unvollständig';
      }
      else if (
        currentStatus === 'complete'
      ) {
        statusText.textContent =
          'Trikotwerte können gespeichert werden';
      }
      else {
        statusText.textContent =
          'Gespeicherten Trikotsatz abrufen';
      }

      actions.classList.toggle(
        'partial',
        currentStatus === 'partial'
      );
    };

    actions.addEventListener(
      'click',
      async event => {
        const getAction =
          event.target.closest('.get');

        const saveAction =
          event.target.closest('.save');

        if (getAction) {
          M.show(root);
          return;
        }

        if (saveAction) {
          await saveUniformSet(root);
        }
      }
    );

    root.addEventListener(
      'input',
      update,
      true
    );

    const insertPosition =
      M.label(
        root,
        'trikots'
      )?.parentElement ||
      root.firstElementChild;

    if (insertPosition) {
      insertPosition.after(
        actions
      );
    }
    else {
      root.prepend(actions);
    }

    update();
  }

  /**
   * Prüft, ob ein bestimmter sichtbarer Text auf der Seite vorkommt.
   */
  function hasVisibleText(
    expectedText
  ) {
    return M.qa(
      'span,div,p,a,button,li'
    ).some(element => {
      if (
        !M.visible(element)
      ) {
        return false;
      }

      const text =
        M.n(
          element.innerText ||
          element.textContent
        );

      return (
        text === expectedText ||
        text.endsWith(
          expectedText
        )
      );
    });
  }

  /**
   * Positioniert den Button für die gespeicherten Trikotsätze.
   */
  function positionOverviewButton() {
    const button =
      M.q('.tm-overview');

    if (!button) {
      return;
    }

    const menuIsOpen =
      hasVisibleText(
        'Profil bearbeiten'
      ) &&
      hasVisibleText(
        'Abmelden'
      );

    button.style.setProperty(
      'left',
      '15px',
      'important'
    );

    button.style.setProperty(
      'right',
      'auto',
      'important'
    );

    button.style.setProperty(
      'bottom',
      menuIsOpen
        ? '154px'
        : '78px',
      'important'
    );

    button.style.setProperty(
      'width',
      '228px',
      'important'
    );

    button.style.setProperty(
      'max-width',
      '228px',
      'important'
    );

    button.style.setProperty(
      'visibility',
      'visible',
      'important'
    );
  }

  /**
   * Aktualisiert die eingeblendeten SULU-Elemente.
   */
  async function refresh() {
    if (!M.onPage()) {
      return;
    }

    /*
     * Erkennt das aktuelle Team bereits beim Öffnen der Seite.
     * Die Optionsseite kann dadurch die automatische Erkennung
     * unmittelbar anzeigen.
     */
    await getEffectiveTeamGender();

    M.blocks().forEach(
      decorate
    );

    let overviewButton =
      M.q('.tm-overview');

    if (!overviewButton) {
      overviewButton =
        document.createElement(
          'button'
        );

      overviewButton.type =
        'button';

      overviewButton.className =
        'tm-overview';

      overviewButton.addEventListener(
        'click',
        () => {
          M.show();
        }
      );

      document.body.append(
        overviewButton
      );
    }

    positionOverviewButton();

    void M.count();
  }

  /**
   * Beobachtet dynamische Änderungen der hockey.de-Anwendung.
   */
  const observer =
    new MutationObserver(() => {
      clearTimeout(
        refreshTimer
      );

      refreshTimer =
        setTimeout(
          refresh,
          130
        );
    });

  observer.observe(
    document.body,
    {
      childList: true,
      subtree: true
    }
  );

  /**
   * Reagiert auf Änderungen im Extension-Speicher.
   */
  try {
    M.api.storage.onChanged.addListener(
      (changes, areaName) => {
        if (
          areaName !== 'local'
        ) {
          return;
        }

        /*
         * Anzahl gespeicherter Trikotsätze aktualisieren.
         */
        if (
          changes[M.K]
        ) {
          void M.count();
        }
      }
    );
  }
  catch {
    /*
     * Der Extension-Kontext wurde möglicherweise
     * durch ein Update ungültig.
     */
  }

  /**
   * Öffnet die Übersicht auf Anfrage des Popups.
   */
  try {
    M.api.runtime.onMessage.addListener(
      message => {
        if (
          message === 'show'
        ) {
          void M.show();
        }
      }
    );
  }
  catch {
    /*
     * Der Extension-Kontext wurde möglicherweise
     * durch ein Update ungültig.
     */
  }

  /**
   * Übersichtsschaltfläche bei Größenänderungen neu positionieren.
   */
  window.addEventListener(
    'resize',
    () => {
      clearTimeout(
        refreshTimer
      );

      refreshTimer =
        setTimeout(
          positionOverviewButton,
          80
        );
    },
    {
      passive: true
    }
  );

  /**
   * Auf das Öffnen und Schließen des hockey.de-Benutzermenüs reagieren.
   */
  document.addEventListener(
    'click',
    () => {
      setTimeout(
        positionOverviewButton,
        40
      );

      setTimeout(
        positionOverviewButton,
        180
      );

      setTimeout(
        positionOverviewButton,
        360
      );
    },
    true
  );

  document.addEventListener(
    'keyup',
    () => {
      setTimeout(
        positionOverviewButton,
        80
      );
    },
    true
  );

  void refresh();
})();