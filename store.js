/* ============================================================
   JASMINE TAKLIFNOMA v2 — ma'lumot adapteri
   Hozir: localStorage. Keyinchalik: Supabase / REST API.
   index.html va admin.html FAQAT shu API bilan gaplashadi,
   shuning uchun backend ulanganda ular o'zgarmaydi.

   API:
     Store.load()            -> data
     Store.save(data)        -> void
     Store.reset()           -> void
     Store.addWish(wish)     -> data
   ============================================================ */

const STORAGE_KEY = 'jasmine_taklifnoma_data';

const Store = (() => {
  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Default model ustiga saqlangan qiymatlarni qo'yadi.
  // Yangi maydon qo'shilsa, eski saqlangan ma'lumot buzilmaydi.
  function merge(base, over) {
    const out = deepClone(base);
    for (const k in over) {
      if (over[k] !== undefined && over[k] !== null) out[k] = over[k];
    }
    return out;
  }

  function load() {
    let raw = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      // Private mode / storage o'chirilgan — default bilan ishlaymiz
      console.warn('Store: localStorage o\'qib bo\'lmadi, default ishlatiladi', e);
      return deepClone(DEFAULT_DATA);
    }
    if (!raw) return deepClone(DEFAULT_DATA);
    try {
      return merge(DEFAULT_DATA, JSON.parse(raw));
    } catch (e) {
      console.warn('Store: saqlangan ma\'lumot buzilgan, default ishlatiladi', e);
      return deepClone(DEFAULT_DATA);
    }
  }

  function save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Store: saqlab bo\'lmadi', e);
      return false;
    }
  }

  function reset() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Store: tozalab bo\'lmadi', e);
    }
  }

  function addWish(wish) {
    const data = load();
    data.wishes = data.wishes || [];
    data.wishes.push(wish);
    save(data);
    return data;
  }

  return { load, save, reset, addWish, deepClone };
})();
