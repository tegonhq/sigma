import {
  type IAnyStateTreeNode,
  type Instance,
  types,
  flow,
} from 'mobx-state-tree';

import type { WorkspaceType } from 'common/types';

import { tegonDatabase } from 'store/database';

import { Workspace } from './models';

export const WorkspaceStore: IAnyStateTreeNode = types
  .model({
    workspace: types.union(Workspace, types.undefined),
  })
  .actions((self) => {
    const update = (workspace: WorkspaceType) => {
      self.workspace = workspace;
    };

    const load = flow(function* (workspaceId: string) {
      self.workspace = yield tegonDatabase.workspaces.get({
        id: workspaceId,
      });
    });

    return { update, load };
  });

export type WorkspaceStoreType = Instance<typeof WorkspaceStore> & {
  workspace: WorkspaceType;
};
