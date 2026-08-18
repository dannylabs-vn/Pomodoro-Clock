class Storage {
  get(key) {
    throw new Error("get() must be implemented by subclass");
  }
  set(key, value) {
    throw new Error("set() must be implemented by subclass");
  }
  remove(key) {
    throw new Error("remove() must be implemented by subclass");
  }
}

class MemoryStorage extends Storage {
  constructor() {
    super();
    this.memory = new Map();
  }

  get(key) {
    return this.memory.get(key) || [];
  }

  set(key, value) {
    this.memory.set(key, value);
  }

  remove(key) {
    this.memory.delete(key);
  }
}

class LocalStorage extends Storage {
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  remove(key) {
    localStorage.removeItem(key);
  }
}

export { Storage, MemoryStorage, LocalStorage };