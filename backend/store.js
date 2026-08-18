import { MemoryStorage, LocalStorage } from "./storage.js";

class Store {
  constructor(prefix, getCurrentUser) {
    this.prefix = prefix;
    this.getCurrentUser = getCurrentUser;
    this.memoryStorage = new MemoryStorage();
    this.localStorage = new LocalStorage();
  }

  getStorage() {
    return this.getCurrentUser() ? this.localStorage : this.memoryStorage;
  }

  getKey() {
    const user = this.getCurrentUser();
    return user ? `${this.prefix}_${user}` : `${this.prefix}_guest`;
  }

  loadData() {
    return this.getStorage().get(this.getKey());
  }

  saveData(data) {
    this.getStorage().set(this.getKey(), data);
  }

  clearGuestData() {
    this.memoryStorage.remove(`${this.prefix}_guest`);
  }
}

export { Store };