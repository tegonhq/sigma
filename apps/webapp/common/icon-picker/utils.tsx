import { Project } from '@tegonhq/ui';
import * as LucideIcons from 'lucide-react';

import { emojiData } from './emoji-data';

export function getEmojiFromId(id: number) {
  return emojiData.find((em) => em.id === id);
}

export const getIcon = (icon: string, size: number) => {
  if (icon) {
    const iconData = JSON.parse(icon);

    if (iconData.icon) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const IconComponent = (LucideIcons as any)[iconData.icon];

      return (
        <IconComponent
          size={size}
          style={{ color: iconData.color }}
          className="shrink-0"
        />
      );
    }

    if (iconData.emoji) {
      return (
        <div
          className="flex items-center shrink-0"
          style={{ fontSize: size * 0.8 }}
        >
          {iconData.emoji}
        </div>
      );
    }
  }

  return <Project size={size} />;
};
