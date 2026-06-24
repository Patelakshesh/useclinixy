const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src/features').filter(f => f.endsWith('.ts'));

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('axios.create')) {
    content = content.replace(/import axios from 'axios';\s+/, '');
    content = content.replace(/const (adminApi|api) = axios\.create\(\{[\s\S]*?\}\);/, "import { $1 } from '@/lib/axios';");
    fs.writeFileSync(f, content);
    console.log('Updated ' + f);
  }
});
