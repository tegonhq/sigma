export const OnboardingContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'Sigma is your all-in-one platform to manage tasks, organise notes and plan your day with the help of a built-in personal assistant',
        },
        {
          type: 'text',
          text: '.',
          marks: [
            {
              type: 'link',
              attrs: {
                href: 'http://assistant.Discover',
                target: '_blank',
                rel: 'noopener noreferrer nofollow',
                class: 'text-primary cursor-pointer',
              },
            },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [
        {
          type: 'text',
          text: 'Discover the basics',
          marks: [{ type: 'bold', attrs: {} }],
        },
      ],
    },
    {
      type: 'taskList',
      content: [
        {
          type: 'taskItem',
          attrs: {},
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Click the checkmark to mark a task as complete',
                },
              ],
            },
          ],
        },
        {
          type: 'taskItem',
          attrs: {},
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: "Create a new task using 'CMD + N' shortcut or type '/' in a page",
                },
              ],
            },
          ],
        },
        {
          type: 'taskItem',
          attrs: {},
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Click the task id (e.g., T-1) to view and add task details',
                },
              ],
            },
          ],
        },
        {
          type: 'taskItem',
          attrs: {},
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Create your first list by clicking the + button in the sidebar',
                },
              ],
            },
          ],
        },
        {
          type: 'taskItem',
          attrs: {},
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Create a new task and schedule a task automatically by typing phrases like "tomorrow"',
                },
              ],
            },
          ],
        },
        {
          type: 'taskItem',
          attrs: {},
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Link an existing task to any page or to my day by typing [[task name]]',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'heading',
      attrs: { level: 2 },
      content: [
        {
          type: 'text',
          text: 'Learn more about Sigma',
          marks: [{ type: 'bold', attrs: {} }],
        },
      ],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Learn more about ' },
                {
                  type: 'text',
                  text: 'basic concepts',
                  marks: [
                    {
                      type: 'link',
                      attrs: {
                        href: 'https://github.com/RedPlanetHQ/sol/wiki',
                        target: '_blank',
                        rel: 'noopener noreferrer nofollow',
                        class: 'text-primary cursor-pointer',
                      },
                    },
                  ],
                },
                { type: 'text', text: ' in Sigma' },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'See all ' },
                {
                  type: 'text',
                  text: 'keyboard shortcuts',
                  marks: [
                    {
                      type: 'link',
                      attrs: {
                        href: 'https://github.com/RedplanetHQ/sol/wiki/keyboard-shortcuts',
                        target: '_blank',
                        rel: 'noopener noreferrer nofollow',
                        class: 'text-primary cursor-pointer',
                      },
                    },
                  ],
                },
                { type: 'text', text: ' to work even faster' },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Join our ' },
                {
                  type: 'text',
                  text: 'discord server',
                  marks: [
                    {
                      type: 'link',
                      attrs: {
                        href: 'https://discord.gg/dVTC3BmgEq',
                        target: '_blank',
                        rel: 'noopener noreferrer nofollow',
                        class: 'text-primary cursor-pointer',
                      },
                    },
                  ],
                },
                {
                  type: 'text',
                  text: ' to be informed about new updates or for support',
                },
              ],
            },
          ],
        },
        {
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'We are open-source, check out our ' },
                {
                  type: 'text',
                  text: 'github repo',
                  marks: [
                    {
                      type: 'link',
                      attrs: {
                        href: 'https://github.com/tegonhq/sigma',
                        target: '_blank',
                        rel: 'noopener noreferrer nofollow',
                        class: 'text-primary cursor-pointer',
                      },
                    },
                  ],
                },
                { type: 'text', text: ' (please give us a star as well)' },
              ],
            },
          ],
        },
      ],
    },
    { type: 'paragraph' },
  ],
};
