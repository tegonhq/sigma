import { Actions, SlackIcon, StackLine } from '@redplanethq/ui';
import { RiDiscordFill, RiGithubFill, RiMailFill } from '@remixicon/react';

import { Gmail, Hevy } from 'icons';

export const ICON_MAPPING = {
  slack: SlackIcon,
  email: RiMailFill,
  discord: RiDiscordFill,
  github: RiGithubFill,
  hevy: Hevy,
  gmail: Gmail,

  // Default icon
  integration: StackLine,
  action: Actions,
};

export type IconType = keyof typeof ICON_MAPPING;

export function getIcon(icon: IconType) {
  if (icon in ICON_MAPPING) {
    return ICON_MAPPING[icon];
  }

  return ICON_MAPPING['integration'];
}

export function getBotIcon(icon: IconType) {
  if (icon in ICON_MAPPING) {
    return ICON_MAPPING[icon];
  }

  return ICON_MAPPING['action'];
}
