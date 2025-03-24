'use client';

import type * as React from 'react';

import {
  Button,
  cn,
  Input,
  ScrollArea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@tegonhq/ui';
import * as LucideIcons from 'lucide-react';
import { useState } from 'react';

import { emojiData } from './emoji-data';

interface IconPickerProps {
  onSelectIcon?: (icon: string, color: string) => void;
  onSelectEmoji?: (emoji: string) => void;
  onRemove?: () => void;
  onUploadIcon?: (file: File) => void;
}

const colorOptions = [
  '#000',
  'oklch(66% 0.1835 292)',
  'oklch(66% 0.1835 169)',
  'oklch(66% 0.1835 30)',
  'oklch(66% 0.1835 308)',
  'oklch(66% 0.1835 339)',
  'oklch(66% 0.1835 277)',
  'oklch(66% 0.1835 30)',
  'oklch(66% 0.1835 71)',
  'oklch(66% 0.1835 228)',
];

export function IconPicker({
  onSelectIcon,
  onSelectEmoji,
  onRemove,
}: IconPickerProps) {
  const [activeTab, setActiveTab] = useState('icons');
  const [iconSearch, setIconSearch] = useState('');
  const [emojiSearch, setEmojiSearch] = useState('');
  const [selectedColor, setSelectedColor] = useState(colorOptions[0]);

  // Filter icons based on search
  const filteredIcons = Object.keys(LucideIcons)
    .filter(
      (iconName) =>
        iconName !== 'createLucideIcon' &&
        iconName.toLowerCase().includes(iconSearch.toLowerCase()),
    )
    .slice(0, 300); // Limit to 120 icons for performance

  // Filter emojis based on search
  const filteredEmojis = emojiSearch
    ? emojiData.filter((emoji) =>
        emoji.name.toLowerCase().includes(emojiSearch.toLowerCase()),
      )
    : emojiData;

  return (
    <div className="w-full max-w-md rounded-lg overflow-hidden">
      <Tabs
        defaultValue="icons"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="icons" className="">
            Icons
          </TabsTrigger>
          <TabsTrigger value="emojis" className="">
            Emojis
          </TabsTrigger>
        </TabsList>

        {/* Icons Tab */}
        <TabsContent value="icons" className="p-0">
          <div className="p-1">
            <div className="flex flex-wrap gap-2 mb-4">
              {colorOptions.map((color, index) => (
                <button
                  key={index}
                  className={cn(
                    'w-6 h-6 rounded-full',
                    selectedColor === color ? 'ring-2 ring-white' : '',
                  )}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
            <div className="relative mb-4">
              <LucideIcons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
              <Input
                placeholder="Search Icons..."
                className="pl-9"
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
              />
            </div>
            <ScrollArea className="h-[250px]">
              <div className="grid grid-cols-8 gap-2">
                {filteredIcons.map((iconName) => {
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  const IconComponent = (LucideIcons as any)[iconName];
                  return (
                    <Button
                      key={iconName}
                      className="flex items-center justify-center p-1 text-foreground"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        onSelectIcon && onSelectIcon(iconName, selectedColor)
                      }
                    >
                      <IconComponent
                        style={
                          selectedColor !== '#000'
                            ? { color: selectedColor }
                            : {}
                        }
                        className={cn('text-foreground')}
                      />
                    </Button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        {/* Emojis Tab */}
        <TabsContent value="emojis" className="p-0">
          <div className="p-1">
            <div className="relative mb-4">
              <LucideIcons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
              <Input
                placeholder="Search Icons..."
                className="pl-9"
                value={iconSearch}
                onChange={(e) => setEmojiSearch(e.target.value)}
              />
            </div>
            <ScrollArea className="h-[250px]">
              <div className="grid grid-cols-8 gap-1">
                {filteredEmojis.map((emoji) => (
                  <Button
                    key={emoji.id}
                    className="flex items-center justify-center p-1"
                    size="sm"
                    variant="ghost"
                    onClick={() => onSelectEmoji && onSelectEmoji(emoji.emoji)}
                  >
                    {emoji.emoji}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end border-border border-t pt-1">
        <Button variant="secondary" onClick={onRemove}>
          Remove
        </Button>
      </div>
    </div>
  );
}
