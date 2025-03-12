import BulletList from '@tiptap/extension-bullet-list';

export default BulletList.extend({
  name: 'taskList',

  addAttributes() {
    return {
      class: {
        default: 'task-list',
        parseHTML: (element) => element.getAttribute('class'),
        renderHTML: (attributes) => {
          return {
            class: attributes.class,
          };
        },
      },
    };
  },
});
