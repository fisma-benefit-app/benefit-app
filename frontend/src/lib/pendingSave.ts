// Lets the header finish a project's waiting auto-save before logging out,
// because logging out revokes the token the save needs.
const noPendingSave = () => Promise.resolve();

let flushPendingSave: () => Promise<void> = noPendingSave;

export const registerPendingSave = (flush: () => Promise<void>) => {
  flushPendingSave = flush;
  return () => {
    if (flushPendingSave === flush) flushPendingSave = noPendingSave;
  };
};

export const savePendingChanges = () => flushPendingSave();
