const selection = figma.currentPage.selection;
const textNodes = selection.filter(node => node.type === 'TEXT') as TextNode[];

if (textNodes.length === 0) {
  figma.notify('Please select at least one text layer. 😊');
  figma.closePlugin();
}

const uniqueFonts = new Set(
  textNodes.map(node => JSON.stringify(node.fontName))
);

Promise.all(
  Array.from(uniqueFonts).map(font =>
    figma.loadFontAsync(JSON.parse(font))
  )
)
  .then(() => {
    textNodes.forEach(node => {
      handleTextCase(node);
    });
  })
  .catch(error => {
    figma.notify('Error loading fonts. Please try again.');
    console.error('Error loading fonts:', error);
  });

function handleTextCase(node: TextNode): void {
  const originalCharacters = node.characters;
  const originalFills = [];

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

    default:
      console.error('Unknown command:', figma.command);
      return;
  }

  // Update the node with the modified text
  node.characters = newText;

  // Reapply the original fills to the corresponding character ranges
  for (let i = 0; i < originalCharacters.length; i++) {
    if (originalFills[i] !== null) {
      node.setRangeFills(i, i + 1, originalFills[i] as Paint[]);
    }
  }

  // Apply the text style after the transformation is done
  node.setTextStyleIdAsync(currentTextStyleId as string).catch(error => {
    console.error('Error applying text style:', error);
  });
}



setTimeout(() => {
  figma.closePlugin();
}, 1000);
