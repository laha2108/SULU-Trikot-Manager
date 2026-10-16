(() => {
  'use strict';
  const M = SULU;
  const SCHEMA_VERSION = 2;
  let contextWarningShown = false;

  const now = () => new Date().toISOString();
  const validContext = () => {
    try { return Boolean(M.api?.runtime?.id); } catch { return false; }
  };
  const warnContext = () => {
    if (contextWarningShown) return;
    contextWarningShown = true;
    M.toast?.('Die Erweiterung wurde aktualisiert. Bitte diese hockey.de-Seite neu laden.');
  };
  async function safe(callback, fallback) {
    if (!validContext()) { warnContext(); return fallback; }
    try { return await callback(); }
    catch (error) {
      if (String(error?.message || error).includes('Extension context invalidated')) warnContext();
      else { console.error('SULU Trikot-Manager', error); M.toast?.('Lokale Daten konnten nicht verarbeitet werden.'); }
      return fallback;
    }
  }
  function migrate(item) {
    const createdAt = item.createdAt || item.savedAt || now();
    return {
      id: item.id || crypto.randomUUID(), schemaVersion: SCHEMA_VERSION,
      title: item.title || 'Unbenannter Trikotsatz',
      colors: { shirt: item.colors?.shirt || '', bottom: item.colors?.bottom || '', socks: item.colors?.socks || '', keeper: item.colors?.keeper || '' },
      gender: item.gender || 'unknown', standard: Boolean(item.standard), alternative: Boolean(item.alternative),
      createdAt, updatedAt: item.updatedAt || item.savedAt || createdAt,
      sourceTeamId: item.sourceTeamId || null,
    };
  }
  async function getAll() {
    const data = await safe(async () => (await M.api.storage.local.get(M.K))[M.K] || [], []);
    return data.map(migrate);
  }
  async function write(items) { return safe(async () => { await M.api.storage.local.set({ [M.K]: items }); return true; }, false); }
  async function save(item) {
    const items = await getAll(), index = items.findIndex(x => x.title.toLowerCase() === item.title.toLowerCase());
    const stamp = now(); item = migrate({ ...item, updatedAt: stamp });
    if (index >= 0) { if (!confirm(`„${item.title}“ überschreiben?`)) return false; item.id = items[index].id; item.createdAt = items[index].createdAt; items[index] = item; }
    else items.push(item);
    return write(items);
  }
  async function remove(id) { const a=await getAll(),x=a.find(y=>y.id===id);if(!x||!confirm(`„${x.title}“ löschen?`))return false;return write(a.filter(y=>y.id!==id)); }
  async function patch(id, changes) { const a=await getAll(),i=a.findIndex(x=>x.id===id);if(i<0)return false;a[i]=migrate({...a[i],...changes,updatedAt:now()});return write(a); }
  function exportData(items) { return JSON.stringify({application:'SULU Trikot-Manager',formatVersion:2,exportedAt:now(),uniformSets:items.map(migrate)},null,2); }
  async function importData(payload, mode='merge') {
    if (payload?.application!=='SULU Trikot-Manager'||!Array.isArray(payload.uniformSets)) throw new Error('Ungültige Sicherungsdatei.');
    const importedAt=now();
    const current=mode==='replace'?[]:await getAll(), map=new Map(current.map(x=>[x.title.toLowerCase(),x]));
    for(const raw of payload.uniformSets){
      const x=migrate({...raw,createdAt:importedAt,updatedAt:importedAt,savedAt:importedAt});
      x.createdAt=importedAt;
      x.updatedAt=importedAt;
      const key=x.title.toLowerCase();
      if(!map.has(key)||mode==='overwrite')map.set(key,x);
    }
    return write([...map.values()]);
  }
  M.store={get:getAll,save,del:remove,patch,exportData,importData,isContextValid:validContext,migrate};
})();
