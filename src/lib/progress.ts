export async function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("git-practice-progress", 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains("store")) {
        req.result.createObjectStore("store");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getCompletedExercises(): Promise<string[]> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("store", "readonly");
      const req = tx.objectStore("store").get("completed");
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function markExerciseCompleted(id: string): Promise<void> {
  try {
    const completed = await getCompletedExercises();
    if (completed.includes(id)) return;
    const next = [...completed, id];
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("store", "readwrite");
      tx.objectStore("store").put(next, "completed");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // silently fail in case of incognito mode IDB restrictions
  }
}

export async function clearAllProgress(): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction("store", "readwrite");
      tx.objectStore("store").delete("completed");
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {}
}