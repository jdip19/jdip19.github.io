// Utility to get all font ranges in a text node
async function loadAllFontsForNode(node: TextNode): Promise<boolean> {
  const fontPromises: Promise<void>[] = [];
  let failed = false;
  for (let i = 0; i < node.characters.length; ) {
    const font = node.getRangeFontName(i, i + 1);
    let j = i + 1;
    // Find the next range where the font changes
    while (j < node.characters.length && JSON.stringify(node.getRangeFontName(j, j + 1)) === JSON.stringify(font)) {
      j++;
    }
    if (font !== figma.mixed) {
      fontPromises.push(
        figma.loadFontAsync(font).catch(err => {
          console.error('Error loading font:', font, err);
          failed = true;
        })
      );
    }
    i = j;
  }
  await Promise.all(fontPromises);
  return !failed;
}

// Utility to get all unique fonts from all text nodes
function getAllUniqueFonts(textNodes: TextNode[]): FontName[] {
  const fontSet = new Set<string>();
  const fonts: FontName[] = [];
  for (const node of textNodes) {
    for (let i = 0; i < node.characters.length; ) {
      const font = node.getRangeFontName(i, i + 1);
      let j = i + 1;
      while (j < node.characters.length && JSON.stringify(node.getRangeFontName(j, j + 1)) === JSON.stringify(font)) {
        j++;
      }
      const fontKey = JSON.stringify(font);
      if (font !== figma.mixed && !fontSet.has(fontKey)) {
        fontSet.add(fontKey);
        fonts.push(font as FontName);
      }
      i = j;
    }
  }
  return fonts;
}

async function loadAllFonts(fonts: FontName[]): Promise<boolean> {
  let failed = false;
  for (const font of fonts) {
    try {
      console.log('Loading font:', font);
      await figma.loadFontAsync(font);
    } catch (err) {
      console.error('Error loading font:', font, err);
      failed = true;
    }
  }
  return !failed;
}

async function processAllTextNodes(textNodes: TextNode[]) {
  let skippedCount = 0;
  for (const node of textNodes) {
    // Warn if the node has mixed fills
    if (node.fills === figma.mixed) {
      figma.notify('Warning: Some text nodes have mixed color styles. These may be lost after processing.');
    }
    try {
      handleTextCase(node);
    } catch (err) {
      skippedCount++;
      console.error('Error processing node:', node, err);
    }
  }
  if (skippedCount > 0) {
    figma.notify(`Skipped ${skippedCount} text node(s) due to processing errors.`);
  }
}

const selection = figma.currentPage.selection;
const textNodes = selection.filter(node => node.type === 'TEXT') as TextNode[];

if (textNodes.length === 0) {
  figma.notify('Please select at least one text layer. 😕');
  figma.closePlugin();
}

const allFonts = getAllUniqueFonts(textNodes);
loadAllFonts(allFonts)
  .then(success => {
    if (!success) {
      figma.notify('Some fonts could not be loaded. Some nodes may be skipped.');
    }
    processAllTextNodes(textNodes);
  })
  .then(() => {
    figma.closePlugin();
  });

function handleTextFormatting(node: TextNode): void {
  // Show UI for text formatting options
  figma.showUI(__html__, { width: 400, height: 300 });
  
  figma.ui.onmessage = async (msg) => {
    switch (msg.type) {
      case 'apply-style':
        await applyTextStyle(msg.keywords, msg.styleId);
        break;
      case 'apply-bold':
        await applyBoldFormatting(msg.keywords);
        break;
      case 'apply-italic':
        await applyItalicFormatting(msg.keywords);
        break;
      case 'apply-underline':
        await applyUnderlineFormatting(msg.keywords);
        break;
      default:
        console.log('Unknown formatting type:', msg.type);
    }
  };
}

async function applyTextStyle(keywords: string, styleId: string): Promise<void> {
  const keywordList = keywords.split(',').map((k: string) => k.trim());
  const textNodes = figma.root.findAll(n => n.type === "TEXT") as TextNode[];

  for (const node of textNodes) {
    await figma.loadFontAsync(node.fontName as FontName);
    const text = node.characters;

    keywordList.forEach((word: string) => {
      let index = text.indexOf(word);
      while (index !== -1) {
        node.setRangeTextStyleId(index, index + word.length, styleId);
        index = text.indexOf(word, index + word.length);
      }
    });
  }
  figma.notify("✅ Text style applied!");
}

async function applyBoldFormatting(keywords: string): Promise<void> {
  const keywordList = keywords.split(',').map((k: string) => k.trim());
  const textNodes = figma.root.findAll(n => n.type === "TEXT") as TextNode[];

  for (const node of textNodes) {
    await figma.loadFontAsync(node.fontName as FontName);
    const text = node.characters;

    keywordList.forEach((word: string) => {
      let index = text.indexOf(word);
      while (index !== -1) {
        // Apply bold formatting logic here
        node.setRangeTextStyleId(index, index + word.length, "bold-style-id");
        index = text.indexOf(word, index + word.length);
      }
    });
  }
  figma.notify("✅ Bold formatting applied!");
}

async function applyItalicFormatting(keywords: string): Promise<void> {
  const keywordList = keywords.split(',').map((k: string) => k.trim());
  const textNodes = figma.root.findAll(n => n.type === "TEXT") as TextNode[];

  for (const node of textNodes) {
    await figma.loadFontAsync(node.fontName as FontName);
    const text = node.characters;

    keywordList.forEach((word: string) => {
      let index = text.indexOf(word);
      while (index !== -1) {
        // Apply italic formatting logic here
        node.setRangeTextStyleId(index, index + word.length, "italic-style-id");
        index = text.indexOf(word, index + word.length);
      }
    });
  }
  figma.notify("✅ Italic formatting applied!");
}

async function applyUnderlineFormatting(keywords: string): Promise<void> {
  const keywordList = keywords.split(',').map((k: string) => k.trim());
  const textNodes = figma.root.findAll(n => n.type === "TEXT") as TextNode[];

  for (const node of textNodes) {
    await figma.loadFontAsync(node.fontName as FontName);
    const text = node.characters;

    keywordList.forEach((word: string) => {
      let index = text.indexOf(word);
      while (index !== -1) {
        // Apply underline formatting logic here
        node.setRangeTextStyleId(index, index + word.length, "underline-style-id");
        index = text.indexOf(word, index + word.length);
      }
    });
  }
  figma.notify("✅ Underline formatting applied!");
}

function handleTextCase(node: TextNode): void {
  const originalCharacters = node.characters;
  const originalFills = [];
  const hadUniformFill = node.fills !== figma.mixed;
  const uniformFill = hadUniformFill ? node.fills : null;
  const hadUniformFillStyle = node.fillStyleId !== figma.mixed;
  const uniformFillStyleId = hadUniformFillStyle ? node.fillStyleId : null;

  // Store the original fills for each character
  for (let i = 0; i < originalCharacters.length; i++) {
    originalFills.push(node.getRangeFills(i, i + 1));
  }

  let newText = originalCharacters;

  // Get the current text style ID dynamically from the selected text node
  const currentTextStyleId = node.textStyleId;
  switch (figma.command) {
    case 'titlecase':
      const conjunctions = ['for', 'as', 'an', 'a', 'in', 'on', 'of', 'am', 'are', 'and', 'to', 'is', 'at', 'also', 'with'];

      // Step 1: Convert all text to lowercase
      newText = newText.toLowerCase();

      // Step 2: Apply Title Case transformation
      newText = newText.replace(/\b(\w+(['’]\w+)?|\w+)\b/g, (match, word) => {
        if (conjunctions.includes(word)) {
          // Keep conjunctions lowercase
          return word;
        } else if (word.includes("'") || word.includes("’")) {
          // Handle words with straight or curly apostrophes
          const apostropheIndex = word.indexOf("'") !== -1 ? word.indexOf("'") : word.indexOf("’");
          const beforeApostrophe = word.slice(0, apostropheIndex + 1); // Part before and including the apostrophe
          const afterApostrophe = word.slice(apostropheIndex + 1); // Part after the apostrophe

          // Capitalize the first letter of the word, and keep the rest lowercase
          return beforeApostrophe.charAt(0).toUpperCase() + beforeApostrophe.slice(1) + afterApostrophe.toLowerCase();
        } else {
          // Capitalize the first letter of standard words
          return match.charAt(0).toUpperCase() + match.slice(1);
        }
      });


      figma.notify('Tadaannn... 🥁 Case changed to TitleCase through Obstaclesss. 😎');
      break;


    case 'sentencecase':
      const allUppercase = newText.split(' ').every(word => word.toUpperCase() === word);

      let titleCaseCount = 0;
      newText.split(' ').every(word => {
        const firstLetter = word.charAt(0);
        const restOfWord = word.slice(1);
        if (firstLetter.toUpperCase() === firstLetter && restOfWord.toLowerCase() === restOfWord) {
          titleCaseCount++;
          return true;
        } else {
          return false;
        }
      });

      if (allUppercase) {
        newText = newText.toLowerCase().charAt(0).toUpperCase() + newText.slice(1).toLowerCase();
      } else if (titleCaseCount >= 2) {
        newText = newText.toLowerCase().replace(/(^|[.!?]\s+)(\w+)/g, firstLetter => firstLetter.charAt(0).toUpperCase() + firstLetter.slice(1).toLocaleLowerCase());
      } else {
        const sentenceRegex = /(^|[.!?]\s+)(\w+)/g;
        newText = newText.replace(sentenceRegex, (match, boundary, word) => {
          const isAcronym = word.length > 1 && word.toUpperCase() === word;
          if (isAcronym) {
            return boundary + word;
          } else {
            return boundary + word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          }
        });
      }

      figma.notify('Tadaannn... 🥁 Your Text case changed to Sentencecase.');
      break;

    case 'uppercase':
      newText = newText.toUpperCase();
      figma.notify('Tadaannn... 🥁 Your Text case changed to UPPERCASE. 👿');
      break;

    case 'lowercase':
      newText = newText.toLowerCase();
      figma.notify('Tadaannn... 🥁 Your Text case changed to lowercase. 😚');
      break;

    case 'addbreakline':
      newText = newText.replace(/\. ?([a-z]|[A-Z])/g, '.\n$1');
      newText = newText.replace(/(^\w|\. ?\w)/gm, (match) => match.toUpperCase());
      figma.notify('Tadaannn... 🥁 Your Text now has line breaks after Fullstop.');
      break;

    case 'rmvspace':
      newText = newText.replace(/\s+/g, ' ');
      figma.notify('Tadaannn... 🥁 Your Text is now unwanted space free. 🤧');
      break;

    case 'rmvbullets':
      // Normalize all line breaks to \n
      newText = newText.replace(/\r\n|\r|\u2028|\u2029/g, '\n');
      // Remove common bullet points and leading whitespace at the start of each line
      newText = newText.replace(/^[\s\u00A0\u00B7\u2022\u2023\u25E6\u2043\u2219\*-]+/gm, '');
      // Optionally, trim trailing whitespace on each line
      newText = newText.replace(/\s+$/gm, '');
      figma.notify('Tadaannn... 🥁 Bullet points and leading spaces removed!');
      break;
    case 'frmtxt':
      handleTextFormatting(node);
      break;  

    default:
      console.error('Unknown command:', figma.command);
      return;
  }

  // Update the node with the modified text
  node.characters = newText;

  // Reapply fill style if it was uniform
  if (hadUniformFillStyle && uniformFillStyleId) {
    node.fillStyleId = uniformFillStyleId;
  } else if (hadUniformFill && uniformFill) {
    node.fills = uniformFill;
  } else {
    // Reapply the original fills to the corresponding character ranges
    for (let i = 0; i < newText.length; i++) {
      if (originalFills[i] !== null && originalFills[i] !== undefined) {
        node.setRangeFills(i, i + 1, originalFills[i] as Paint[]);
      }
    }
  }

  // Apply the text style after the transformation is done
  node.setTextStyleIdAsync(currentTextStyleId as string).catch(error => {
    console.error('Error applying text style:', error);
  });
}
