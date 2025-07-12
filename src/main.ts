import { Plugin, Editor, MarkdownView, Notice } from 'obsidian'
import { imgGalleryInit } from './init';
import { GalleryConfigModal } from './gallery-config-modal';
import { findGalleryAtCursor, replaceGalleryBlock } from './gallery-parser';

export default class ImgGallery extends Plugin {
  async onload() {
    this.registerMarkdownCodeBlockProcessor('img-gallery', (src, el, ctx) => {
      const handler = new imgGalleryInit(this, src, el, this.app)
      ctx.addChild(handler)
    })

    // Add command to insert gallery with interactive configuration
    this.addCommand({
      id: 'insert-masonry-image-gallery',
      name: 'Insert Masonry Image Gallery',
      icon: 'image',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        const modal = new GalleryConfigModal(this.app, (codeBlock: string) => {
          editor.replaceSelection(codeBlock);
        });
        modal.open();
      }
    });

    // Add command to edit existing gallery
    this.addCommand({
      id: 'edit-masonry-image-gallery',
      name: 'Edit Masonry Image Gallery',
      icon: 'edit',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        const parsedGallery = findGalleryAtCursor(editor);
        
        if (!parsedGallery.found) {
          new Notice('No image gallery found at cursor position. Place your cursor inside an existing img-gallery code block.');
          return;
        }

        if (!parsedGallery.settings) {
          new Notice('Could not parse gallery settings. Please check the YAML syntax.');
          return;
        }

        const modal = new GalleryConfigModal(
          this.app, 
          (codeBlock: string) => {
            replaceGalleryBlock(editor, parsedGallery, codeBlock);
          },
          parsedGallery.settings
        );
        modal.open();
      }
    });

    // Add smart command that detects context automatically
    this.addCommand({
      id: 'configure-masonry-image-gallery',
      name: 'Configure Masonry Image Gallery',
      icon: 'settings',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        const parsedGallery = findGalleryAtCursor(editor);
        
        if (parsedGallery.found && parsedGallery.settings) {
          // Edit existing gallery
          const modal = new GalleryConfigModal(
            this.app, 
            (codeBlock: string) => {
              replaceGalleryBlock(editor, parsedGallery, codeBlock);
            },
            parsedGallery.settings
          );
          modal.open();
        } else {
          // Insert new gallery
          const modal = new GalleryConfigModal(this.app, (codeBlock: string) => {
            editor.replaceSelection(codeBlock);
          });
          modal.open();
        }
      }
    });
  }

  onunload() {}
}
