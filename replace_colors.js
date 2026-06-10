const fs = require('fs');
const path = require('path');

const directoryPath = 'c:/Users/hp/Downloads/Shopkeeper App Design/src/app/components';

function replaceColorsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Blue hex to Green hex
  content = content.replace(/#1565C0/gi, '#00891D');
  content = content.replace(/#0D47A1/gi, '#006614'); // Darker blue to darker green
  content = content.replace(/#1E88E5/gi, '#00891D');
  content = content.replace(/#E3F2FD/gi, '#E8F5E9'); // Light blue to light green

  // Purple hex to Orange hex
  content = content.replace(/#6A1B9A/gi, '#EF5A06');
  content = content.replace(/#4A148C/gi, '#D84315'); // Darker purple to darker orange
  content = content.replace(/#F3E5F5/gi, '#FFF3E0'); // Light purple to light orange

  // Tailwind Blue to Green
  content = content.replace(/blue-50\b/g, 'green-50');
  content = content.replace(/blue-100\b/g, 'green-100');
  content = content.replace(/blue-200\b/g, 'green-200');
  content = content.replace(/blue-300\b/g, 'green-300');
  content = content.replace(/blue-400\b/g, 'green-400');
  content = content.replace(/blue-500\b/g, 'green-600');
  content = content.replace(/blue-600\b/g, 'green-600');
  content = content.replace(/blue-700\b/g, 'green-700');
  content = content.replace(/blue-800\b/g, 'green-800');

  // Tailwind Purple to Orange
  content = content.replace(/purple-50\b/g, 'orange-50');
  content = content.replace(/purple-100\b/g, 'orange-100');
  content = content.replace(/purple-200\b/g, 'orange-200');
  content = content.replace(/purple-300\b/g, 'orange-300');
  content = content.replace(/purple-400\b/g, 'orange-400');
  content = content.replace(/purple-500\b/g, 'orange-500');
  content = content.replace(/purple-600\b/g, 'orange-600');
  content = content.replace(/purple-700\b/g, 'orange-700');

  fs.writeFileSync(filePath, content, 'utf8');
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceColorsInFile(fullPath);
    }
  }
}

processDirectory(directoryPath);
console.log('All colors successfully replaced!');
