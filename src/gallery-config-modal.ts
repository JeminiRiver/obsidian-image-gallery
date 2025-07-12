import { App, Modal, Setting, DropdownComponent, SliderComponent, TextComponent, ToggleComponent, ButtonComponent, TFolder, Notice } from 'obsidian';

interface GallerySettings {
  path: string;
  recursive: boolean;
  label: boolean;
  type: string;
  radius: number;
  gutter: number;
  sortby: string;
  sort: string;
  mobile: number;
  columns: number;
  height: number;
}

export class GalleryConfigModal extends Modal {
  private settings: GallerySettings;
  private onSubmit: (yamlConfig: string) => void;
  private isEditing: boolean;

  constructor(app: App, onSubmit: (yamlConfig: string) => void, existingSettings?: any) {
    super(app);
    this.onSubmit = onSubmit;
    this.isEditing = !!existingSettings;
    
    // Initialize with default settings or existing settings
    this.settings = {
      path: existingSettings?.path || '',
      recursive: existingSettings?.recursive || false,
      label: existingSettings?.label || false,
      type: existingSettings?.type || 'horizontal',
      radius: existingSettings?.radius || 0,
      gutter: existingSettings?.gutter || 8,
      sortby: existingSettings?.sortby || 'ctime',
      sort: existingSettings?.sort || 'desc',
      mobile: existingSettings?.mobile || 1,
      columns: existingSettings?.columns || 3,
      height: existingSettings?.height || 260
    };
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    const title = this.isEditing ? 'Edit Masonry Image Gallery' : 'Configure Masonry Image Gallery';
    contentEl.createEl('h2', { text: title });

    this.buildSettingsUI();
    this.buildActionButtons();
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }

  private buildSettingsUI() {
    const { contentEl } = this;

    // Path setting with folder picker
    new Setting(contentEl)
      .setName('Gallery Path')
      .setDesc('Path to the folder containing images (relative to vault root)')
      .addText((text: TextComponent) => {
        text.setPlaceholder('e.g., Attachments/Photos')
          .setValue(this.settings.path)
          .onChange((value) => {
            this.settings.path = value;
          });
      })
      .addButton((button: ButtonComponent) => {
        button.setButtonText('Browse')
          .setTooltip('Select folder from vault')
          .onClick(() => {
            this.openFolderPicker();
          });
      });

    // Gallery type
    new Setting(contentEl)
      .setName('Gallery Type')
      .setDesc('Layout style for the image gallery')
      .addDropdown((dropdown: DropdownComponent) => {
        dropdown.addOption('horizontal', 'Horizontal Masonry')
          .addOption('vertical', 'Vertical Masonry')
          .setValue(this.settings.type)
          .onChange((value) => {
            this.settings.type = value;
            this.refreshConditionalSettings();
          });
      });

    // Common settings
    new Setting(contentEl)
      .setName('Image Border Radius')
      .setDesc('Corner rounding for images (in pixels)')
      .addSlider((slider: SliderComponent) => {
        slider.setLimits(0, 20, 1)
          .setValue(this.settings.radius)
          .setDynamicTooltip()
          .onChange((value) => {
            this.settings.radius = value;
          });
      });

    new Setting(contentEl)
      .setName('Image Spacing')
      .setDesc('Gap between images (in pixels)')
      .addSlider((slider: SliderComponent) => {
        slider.setLimits(0, 50, 1)
          .setValue(this.settings.gutter)
          .setDynamicTooltip()
          .onChange((value) => {
            this.settings.gutter = value;
          });
      });

    // Sorting options
    new Setting(contentEl)
      .setName('Sort Images By')
      .setDesc('How to order images in the gallery')
      .addDropdown((dropdown: DropdownComponent) => {
        dropdown.addOption('ctime', 'Creation Time')
          .addOption('mtime', 'Modified Time')
          .addOption('name', 'File Name')
          .setValue(this.settings.sortby)
          .onChange((value) => {
            this.settings.sortby = value;
          });
      });

    new Setting(contentEl)
      .setName('Sort Order')
      .setDesc('Direction for sorting')
      .addDropdown((dropdown: DropdownComponent) => {
        dropdown.addOption('desc', 'Descending (Newest/Z-A first)')
          .addOption('asc', 'Ascending (Oldest/A-Z first)')
          .setValue(this.settings.sort)
          .onChange((value) => {
            this.settings.sort = value;
          });
      });

    // Advanced options
    new Setting(contentEl)
      .setName('Include Subfolders')
      .setDesc('Recursively include images from subfolders')
      .addToggle((toggle: ToggleComponent) => {
        toggle.setValue(this.settings.recursive)
          .onChange((value) => {
            this.settings.recursive = value;
          });
      });

    new Setting(contentEl)
      .setName('Show Labels')
      .setDesc('Display image filenames as labels')
      .addToggle((toggle: ToggleComponent) => {
        toggle.setValue(this.settings.label)
          .onChange((value) => {
            this.settings.label = value;
          });
      });

    // Conditional settings containers
    this.buildConditionalSettings();
  }

  private buildConditionalSettings() {
    const { contentEl } = this;

    // Find the button container to insert before it
    const buttonContainer = contentEl.querySelector('.modal-button-container');
    
    // Create a container for conditional settings that we can easily replace
    const conditionalContainer = contentEl.createEl('div', { cls: 'conditional-settings-container' });
    
    // Insert the conditional container before the buttons
    if (buttonContainer) {
      contentEl.insertBefore(conditionalContainer, buttonContainer);
    }

    // Add a visual header for type-specific settings if there are any
    if (this.settings.type === 'horizontal' || this.settings.type === 'vertical') {
      const headerEl = conditionalContainer.createEl('div', { 
        cls: 'setting-item-heading',
        text: `${this.settings.type.charAt(0).toUpperCase() + this.settings.type.slice(1)} Gallery Settings`
      });
      headerEl.style.fontSize = '14px';
      headerEl.style.fontWeight = '600';
      headerEl.style.marginBottom = '10px';
      headerEl.style.color = 'var(--text-muted)';
    }

    // Horizontal gallery specific settings
    if (this.settings.type === 'horizontal') {
      new Setting(conditionalContainer)
        .setName('Row Height')
        .setDesc('Height of each row in pixels')
        .addSlider((slider: SliderComponent) => {
          slider.setLimits(100, 500, 10)
            .setValue(this.settings.height)
            .setDynamicTooltip()
            .onChange((value) => {
              this.settings.height = value;
            });
        });
    }

    // Vertical gallery specific settings
    if (this.settings.type === 'vertical') {
      new Setting(conditionalContainer)
        .setName('Desktop Columns')
        .setDesc('Number of columns for desktop view')
        .addSlider((slider: SliderComponent) => {
          slider.setLimits(1, 6, 1)
            .setValue(this.settings.columns)
            .setDynamicTooltip()
            .onChange((value) => {
              this.settings.columns = value;
            });
        });

      new Setting(conditionalContainer)
        .setName('Mobile Columns')
        .setDesc('Number of columns for mobile view')
        .addSlider((slider: SliderComponent) => {
          slider.setLimits(1, 3, 1)
            .setValue(this.settings.mobile)
            .setDynamicTooltip()
            .onChange((value) => {
              this.settings.mobile = value;
            });
        });
    }
  }

  private refreshConditionalSettings() {
    const { contentEl } = this;
    // Remove only the conditional settings container
    const existingContainer = contentEl.querySelector('.conditional-settings-container');
    if (existingContainer) {
      existingContainer.remove();
    }
    this.buildConditionalSettings();
  }

  private buildActionButtons() {
    const { contentEl } = this;

    const buttonContainer = contentEl.createEl('div', { cls: 'modal-button-container' });
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'space-between';
    buttonContainer.style.marginTop = '20px';

    // Preview button
    const previewButton = buttonContainer.createEl('button', { 
      text: 'Preview YAML', 
      cls: 'mod-cta' 
    });
    previewButton.onclick = () => {
      this.showYamlPreview();
    };

    // Action buttons container
    const actionContainer = buttonContainer.createEl('div');
    actionContainer.style.display = 'flex';
    actionContainer.style.gap = '10px';

    // Cancel button
    const cancelButton = actionContainer.createEl('button', { text: 'Cancel' });
    cancelButton.onclick = () => {
      this.close();
    };

    // Insert/Update button
    const actionButtonText = this.isEditing ? 'Update Gallery' : 'Insert Gallery';
    const insertButton = actionContainer.createEl('button', { 
      text: actionButtonText, 
      cls: 'mod-cta' 
    });
    insertButton.onclick = () => {
      this.insertGallery();
    };
  }

  private openFolderPicker() {
    // Simple folder picker - list available folders
    const folders = this.getAllFolders();
    
    if (folders.length === 0) {
      new Notice('No folders found in vault');
      return;
    }

    // Create a simple selection modal
    const folderModal = new Modal(this.app);
    folderModal.titleEl.setText('Select Folder');
    
    folders.forEach(folder => {
      const folderEl = folderModal.contentEl.createEl('div', {
        text: folder.path,
        cls: 'folder-picker-item'
      });
      folderEl.style.padding = '8px';
      folderEl.style.cursor = 'pointer';
      folderEl.style.borderRadius = '4px';
      
      folderEl.onmouseover = () => {
        folderEl.style.backgroundColor = 'var(--background-modifier-hover)';
      };
      folderEl.onmouseout = () => {
        folderEl.style.backgroundColor = '';
      };
      
      folderEl.onclick = () => {
        this.settings.path = folder.path;
        this.refreshUI();
        folderModal.close();
      };
    });

    folderModal.open();
  }

  private getAllFolders(): TFolder[] {
    const folders: TFolder[] = [];
    
    const traverse = (folder: TFolder) => {
      folders.push(folder);
      folder.children.forEach(child => {
        if (child instanceof TFolder) {
          traverse(child);
        }
      });
    };

    if (this.app.vault.getRoot() instanceof TFolder) {
      this.app.vault.getRoot().children.forEach(child => {
        if (child instanceof TFolder) {
          traverse(child);
        }
      });
    }

    return folders;
  }

  private refreshUI() {
    // Find the path input and update its value
    const pathInput = this.contentEl.querySelector('input[placeholder*="Attachments"]') as HTMLInputElement;
    if (pathInput) {
      pathInput.value = this.settings.path;
    }
  }

  private showYamlPreview() {
    const yaml = this.generateYaml();
    
    const previewModal = new Modal(this.app);
    previewModal.titleEl.setText('YAML Preview');
    
    const codeEl = previewModal.contentEl.createEl('pre');
    codeEl.style.backgroundColor = 'var(--background-primary-alt)';
    codeEl.style.padding = '10px';
    codeEl.style.borderRadius = '4px';
    codeEl.style.fontSize = '14px';
    codeEl.style.fontFamily = 'monospace';
    
    codeEl.createEl('code', { text: yaml });
    
    previewModal.open();
  }

  private generateYaml(): string {
    const lines: string[] = [];
    
    // Always include path
    lines.push(`path: ${this.settings.path}`);
    
    // Only include non-default values
    if (this.settings.type !== 'horizontal') {
      lines.push(`type: ${this.settings.type}`);
    }
    
    if (this.settings.radius !== 0) {
      lines.push(`radius: ${this.settings.radius}`);
    }
    
    if (this.settings.gutter !== 8) {
      lines.push(`gutter: ${this.settings.gutter}`);
    }
    
    if (this.settings.sortby !== 'ctime') {
      lines.push(`sortby: ${this.settings.sortby}`);
    }
    
    if (this.settings.sort !== 'desc') {
      lines.push(`sort: ${this.settings.sort}`);
    }
    
    if (this.settings.recursive) {
      lines.push(`recursive: ${this.settings.recursive}`);
    }
    
    if (this.settings.label) {
      lines.push(`label: ${this.settings.label}`);
    }
    
    // Type-specific settings
    if (this.settings.type === 'horizontal' && this.settings.height !== 260) {
      lines.push(`height: ${this.settings.height}`);
    }
    
    if (this.settings.type === 'vertical') {
      if (this.settings.columns !== 3) {
        lines.push(`columns: ${this.settings.columns}`);
      }
      if (this.settings.mobile !== 1) {
        lines.push(`mobile: ${this.settings.mobile}`);
      }
    }
    
    return lines.join('\n');
  }

  private insertGallery() {
    if (!this.settings.path.trim()) {
      new Notice('Please specify a path for the gallery');
      return;
    }

    const yaml = this.generateYaml();
    const codeBlock = `\`\`\`img-gallery\n${yaml}\n\`\`\``;
    
    this.onSubmit(codeBlock);
    this.close();
  }
}