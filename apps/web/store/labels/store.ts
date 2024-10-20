import {
  type IAnyStateTreeNode,
  type Instance,
  types,
  flow,
} from 'mobx-state-tree';

import type { LabelType } from 'common/types';

import { sigmaDatabase } from 'store/database';

import { Label } from './models';

export const LabelsStore: IAnyStateTreeNode = types
  .model({
    labels: types.array(Label),
    workspaceId: types.union(types.string, types.undefined),
  })
  .actions((self) => {
    const update = (label: LabelType, id: string) => {
      const indexToUpdate = self.labels.findIndex((obj) => obj.id === id);

      if (indexToUpdate !== -1) {
        // Update the object at the found index with the new data
        self.labels[indexToUpdate] = {
          ...self.labels[indexToUpdate],
          ...label,

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      } else {
        self.labels.push(label);
      }
    };
    const deleteById = (id: string) => {
      const indexToDelete = self.labels.findIndex((obj) => obj.id === id);

      if (indexToDelete !== -1) {
        self.labels.splice(indexToDelete, 1);
      }
    };

    const load = flow(function* () {
      const labels = yield sigmaDatabase.labels.toArray();

      self.labels = labels;
    });

    return { update, deleteById, load };
  })
  .views((self) => ({
    getLabelsWithIds(ids: string[]) {
      return self.labels.filter((label: LabelType) => ids.includes(label.id));
    },
    getLabelWithId(id: string) {
      return self.labels.find((label: LabelType) => label.id === id);
    },
    getLabelWithValues(names: string[]) {
      return names
        .map((key: string) => {
          const label = self.labels.find(
            (label: LabelType) =>
              label.name.toLowerCase() === key.toLowerCase(),
          );

          return label?.id;
        })
        .filter(Boolean);
    },
  }));

export type LabelsStoreType = Instance<typeof LabelsStore> & {
  labels: LabelType[];
  workspaceId: string;
};
