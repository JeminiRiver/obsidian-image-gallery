import { parseYaml } from 'obsidian';

export interface ParsedGallery {
  found: boolean;
  settings?: any;
  startLine: number;
  endLine: number;
  fullText: string;
}

export function findGalleryAtCursor(editor: any): ParsedGallery {
  const cursor = editor.getCursor();
  const doc = editor.getDoc();
  const totalLines = doc.lineCount();
  
  // Search backwards and forwards from cursor to find code block boundaries
  let startLine = -1;
  let endLine = -1;
  
  // Search backwards for opening ```img-gallery
  for (let i = cursor.line; i >= 0; i--) {
    const line = doc.getLine(i);
    if (line.trim() === '```img-gallery') {
      startLine = i;
      break;
    }
    // If we hit another code block or go too far, stop
    if (line.trim().startsWith('```') && !line.includes('img-gallery')) {
      break;
    }
  }
  
  // Search forwards for closing ```
  if (startLine !== -1) {
    for (let i = cursor.line; i < totalLines; i++) {
      const line = doc.getLine(i);
      if (i > startLine && line.trim() === '```') {
        endLine = i;
        break;
      }
    }
  }
  
  if (startLine === -1 || endLine === -1) {
    return { found: false, startLine: -1, endLine: -1, fullText: '' };
  }
  
  // Extract the YAML content between the markers
  const yamlLines: string[] = [];
  for (let i = startLine + 1; i < endLine; i++) {
    yamlLines.push(doc.getLine(i));
  }
  
  const yamlContent = yamlLines.join('\n');
  const fullText = doc.getRange(
    { line: startLine, ch: 0 },
    { line: endLine, ch: doc.getLine(endLine).length }
  );
  
  try {
    const settings = parseYaml(yamlContent);
    return {
      found: true,
      settings,
      startLine,
      endLine,
      fullText
    };
  } catch (error) {
    // If YAML parsing fails, still return the found block but without settings
    return {
      found: true,
      settings: undefined,
      startLine,
      endLine,
      fullText
    };
  }
}

export function replaceGalleryBlock(editor: any, parsedGallery: ParsedGallery, newCodeBlock: string): void {
  if (!parsedGallery.found) return;
  
  const doc = editor.getDoc();
  
  // Replace the entire code block
  doc.replaceRange(
    newCodeBlock,
    { line: parsedGallery.startLine, ch: 0 },
    { line: parsedGallery.endLine, ch: doc.getLine(parsedGallery.endLine).length }
  );
}