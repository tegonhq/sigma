/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSnapshot, applySnapshot, types } from 'mobx-state-tree';

import { sigmaDatabase } from 'store/database';

// Define the HistoryManager model
const HistoryManagerModel = types
  .model('HistoryManager', {
    history: types.array(types.frozen()), // Use frozen type for snapshots
    currentIndex: types.number,
  })
  .actions((self) => ({
    // Push the current snapshot into the history
    pushSnapshot(store: any) {
      const snapshot = getSnapshot(store);
      self.history.slice(0, self.currentIndex + 1); // Remove forward states
      self.history.push(snapshot);
      self.currentIndex++;

      (self as any).saveCurrentStateToIndexedDB(snapshot);
    },

    // Go back in the history and apply the snapshot
    goBack(store: any) {
      if (self.currentIndex > 0) {
        self.currentIndex--;
        const snapshot = self.history[self.currentIndex];
        applySnapshot(store, snapshot);

        (self as any).saveCurrentStateToIndexedDB(snapshot);
      }
    },

    // Go forward in the history and apply the snapshot
    goForward(store: any) {
      if (self.currentIndex < self.history.length - 1) {
        self.currentIndex++; // Increment currentIndex before accessing the snapshot
        const snapshot = self.history[self.currentIndex];
        applySnapshot(store, snapshot);

        (self as any).saveCurrentStateToIndexedDB(snapshot);
      }
    },

    // Save the current state to IndexedDB
    async saveCurrentStateToIndexedDB(snapshot: any) {
      await sigmaDatabase.application.put(snapshot, snapshot.id); // Save the snapshot to the application table
    },
  }))
  .views((self) => ({
    // Check if there is more history to go back
    get canGoBack() {
      return self.currentIndex > 0;
    },

    // Check if there is more history to go forward
    get canGoForward() {
      return self.currentIndex < self.history.length - 1;
    },
  }));

// Create an instance of the HistoryManager model
export const historyManager = HistoryManagerModel.create({
  history: [],
  currentIndex: -1,
});
