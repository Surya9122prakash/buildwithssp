const fs = require('fs');
const content = fs.readFileSync('d:/portfolio_build_with_ssp/src/app/page.tsx', 'utf8');

let braces = 0;
let parens = 0;
let brackets = 0;

let inSingleQuote = false;
let inDoubleQuote = false;
let inTemplate = false;
let inSingleComment = false;
let inMultiComment = false;

let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  let startBraces = braces;
  let startParens = parens;
  
  for (let j = 0; j < line.length; j++) {
    let char = line[j];
    let next = line[j+1];
    
    if (inSingleComment) {
      continue;
    }
    if (inMultiComment) {
      if (char === '*' && next === '/') {
        inMultiComment = false;
        j++;
      }
      continue;
    }
    if (inSingleQuote) {
      if (char === "'" && line[j-1] !== '\\') inSingleQuote = false;
      continue;
    }
    if (inDoubleQuote) {
      if (char === '"' && line[j-1] !== '\\') inDoubleQuote = false;
      continue;
    }
    if (inTemplate) {
      if (char === '`' && line[j-1] !== '\\') inTemplate = false;
      continue;
    }
    
    if (char === '/' && next === '/') {
      inSingleComment = true;
      j++;
    } else if (char === '/' && next === '*') {
      inMultiComment = true;
      j++;
    } else if (char === "'") {
      inSingleQuote = true;
    } else if (char === '"') {
      inDoubleQuote = true;
    } else if (char === '`') {
      inTemplate = true;
    } else if (char === '{') {
      braces++;
    } else if (char === '}') {
      braces--;
    } else if (char === '(') {
      parens++;
    } else if (char === ')') {
      parens--;
    } else if (char === '[') {
      brackets++;
    } else if (char === ']') {
      brackets--;
    }
  }
  
  // reset single line comment at end of line
  inSingleComment = false;
  
  if (braces !== startBraces || parens !== startParens) {
    console.log(`Line ${i + 1}: braces = ${braces} (diff ${braces - startBraces}), parens = ${parens} (diff ${parens - startParens})`);
    console.log(`  Source: ${line.trim()}`);
  }
}

console.log(`Final: braces=${braces}, parens=${parens}, brackets=${brackets}`);
