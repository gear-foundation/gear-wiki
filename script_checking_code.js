#!/usr/bin/env node

const fs = require('fs');
const axios = require('axios');
const path = require('path');
const chalk = require('chalk');
// Define the base URL for GitHub
const baseUrl = 'https://raw.githubusercontent.com/gear-foundation/dapps/master/contracts/';

// !!!!!!!!!!! ATTENTION !!!!!!!!!!!
// This function main() checks ALL md files in the given directory
// Uncomment when all contracts have been fixed
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// async function main() {
//   const directoryPath = 'docs/examples/';

//   const files = fs.readdirSync(directoryPath);

//   for (const file of files) {
//     if (path.extname(file) === '.md') {
//       const filePath = path.join(directoryPath, file);
//       const fileContent = fs.readFileSync(filePath, 'utf8');

//       // Regex for the code blocks search
//       const codeBlocksRegex = /```rust\s+title="([^"]+)"\s+([\s\S]+?)```/g;

//       let match;
//       while ((match = codeBlocksRegex.exec(fileContent))) {
//         const title = match[1];
//         const wiki_code_section = match[2];

//         const split_code = splitCode(wiki_code_section);

//         for (const code of split_code) {
//           //console.log(`code: ${code}`);
//           checkCodeInFile(code, title);
//         }
//       }
//     }
//   }
// }


async function main(filePaths) {
  const directoryPath = 'docs/examples/';
  for (const filePath of filePaths) {
    const fullPath = path.join(directoryPath, filePath);
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    const codeBlocksRegex = /```rust\s+title="([^"]+)"\s+([\s\S]+?)```/g;

    let match;
    while ((match = codeBlocksRegex.exec(fileContent))) {
      const title = match[1];
      const wiki_code_section = match[2];

      const split_code = splitCode(wiki_code_section);
      for (const code of split_code) {
        const found = await checkCodeInFile(code, title);
        if (!found)
          process.exit(1);
      }
    }
  }
}

// the text may contain "// .." therefore,
// it was decided to divide it into sections and process them separately in the future as independent code sections.
// this function divides the text into blocks where the separator is a string starting with "//.."  or other variations.
function splitCode(inputText) {
  const blocks = [];
  let currentBlock = [];

  const lines = inputText.split('\n');

  const commentRegex = /^\/\/\/?\s*\.{2,3}\s*/; // for comments such as "/// ...", "/// .."

  for (const line of lines) {
    if (commentRegex.test(line.trim())) {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock.join('\n'));
      }
      currentBlock = [];
    } else {
      currentBlock.push(line);
    }
  }

  if (currentBlock.length > 0) {
    blocks.push(currentBlock.join('\n'));
  }

  return blocks;
}

// this function takes a path relative to the base Url and returns all the code,
// in this case with a file that is located on github
async function getFileContents(title) {
  const fileUrl = baseUrl + title; // Form the full URL
  try {
    const response = await axios.get(fileUrl);
    if (response.status === 200) {
      const content = response.data;
      return content;
    } else {
      console.error(`File retrieval error: ${response.status}`);
      return null;
    }
  } catch (error) {
    console.error(`Error when requesting to GitHub: ${error.message}`);
    return null;
  }
}

async function checkCodeInFile(wiki_code, title) {
  try {
    const fileContents = await getFileContents(title);

    if (fileContents === null) {
      console.log('An error occurred while receiving the file');
      return false;
    }
    const matchingBlock = findMatchingBlock(fileContents, wiki_code);
    if (matchingBlock !== null) {
      console.log(title, '→', chalk.green`Ok`);
    } else {
      console.error(title, '→', chalk.red`Error`);
      console.error();
      console.error(chalk.redBright`${wiki_code}`);
      console.error();
      console.error('Check the code: https://github.com/gear-foundation/dapps/blob/master/contracts/' + title);
      return false;
    }
  } catch (error) {
    console.error(`Error: ${error}`);
    return false;
  }
  return true;
}

// this function takes code from github and from the wiki and checks it for presence.
// initially removing spaces and ignoring comments
function findMatchingBlock(git_code, wiki_text) {
  const lines = git_code.split('\n').map(line => line.trim());
  const wiki_lines = wiki_text.trim().split('\n').map(line => line.trim()).filter(line => !line.startsWith('//') && !line.startsWith('///'));
  // Array to store matching blocks
  const matchingBlocks = [];

  for (let startIndex = 0; startIndex < lines.length; startIndex++) {
    const currentLine = lines[startIndex];

    if (currentLine.includes(wiki_lines[0])) {
      // If the first line matches, check the sequence of lines
      let match = true;
      let wikiLineIndex = 1; // Index of the next line in wiki_lines
      let i = 1;
      while (wikiLineIndex < wiki_lines.length) {
        const lineToCompare = lines[startIndex + i];
        i++;
        // Ignore strings starting with '// ' or '/// '
        if (lineToCompare.trim().startsWith('//') || lineToCompare.trim().startsWith('///')) {
          continue;
        }

        if (!lineToCompare.includes(wiki_lines[wikiLineIndex])) {
          match = false;
          break;
        }

        wikiLineIndex++; // Move to the next line in wiki_lines
      }

      if (match) {
        matchingBlocks.push(lines.slice(startIndex, startIndex + wiki_lines.length).join('\n'));
      }
    }
  }

  if (matchingBlocks.length > 0) {
    return matchingBlocks;
  }

  return null;
}

// some contracts are commented out because they are subject to correction,
// after them the necessary lines should be uncommented.
const filePaths = [
  'ping.md',
  'DeFi/crowdsale.md',
  // 'DeFi/dex.md',
  'DeFi/dutch-auction.md',
  'DeFi/escrow.md',
  'DeFi/multisig-wallet.md',
  'DeFi/staking.md',

  'Gaming/battleship.md',
  'Gaming/galactic-express.md',
  'Gaming/game-of-chance.md',
  'Gaming/monopoly.md',
  'Gaming/rock-paper-scissors.md',
  'Gaming/tamagotchi.md',
  'Gaming/tamagotchi-battle.md',
  'Gaming/tequila-train.md',
  'Governance/DAO.md',

  'Infra/dein.md',
  'Infra/supply-chain.md',
  'Infra/varatube.md',

  'NFTs/concert.md',
  'NFTs/dynamic-nft.md',
  'NFTs/nft-pixelboard.md',
  'NFTs/onchain-nft.md',

  // 'Standards/vft.md',
  // 'Standards/gmt-1155.md',
  // 'Standards/gnft-721.md',
  // 'Standards/rmrk.md',
  'Standards/gnft-4907.md',

];

main(filePaths);
