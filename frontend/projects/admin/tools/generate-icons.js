const fs = require('fs');
const path = require('path');

const ROOT = process.cwd(); // run this script from frontend/projects/admin
const SRC = path.join(ROOT, 'src');
const OUT_DIR = path.join(SRC, 'app', 'shared', 'icons');
const OUT_FILE = path.join(OUT_DIR, 'icons.module.ts');

function walk(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  files.forEach((f) => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      walk(full, filelist);
    } else {
      filelist.push(full);
    }
  });
  return filelist;
}

function toPascal(s) {
  return s
    .split(/[-_:\s]+/)
    .map(x => x.charAt(0).toUpperCase() + x.slice(1))
    .join('');
}

function toIdentifier(iconName) {
  // e.g. "arrow-left" -> "lucideArrowLeft"
  return 'lucide' + toPascal(iconName);
}

function findLucideIcons(files) {
  const iconNames = new Set();
  const lucideTagRegex = /<\s*lucide-icon[^>]*name\s*=\s*["']([^"']+)["'][^>]*>/gi;
  files.forEach(f => {
    if (!f.includes(`${path.sep}node_modules${path.sep}`) && f.endsWith('.html')) {
      const content = fs.readFileSync(f, 'utf8');
      let m;
      while ((m = lucideTagRegex.exec(content)) !== null) {
        iconNames.add(m[1]);
      }
    }
  });
  return Array.from(iconNames);
}

function generateModule(iconNames) {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  if (iconNames.length === 0) {
    // write a minimal template with a note
    const content = `import { NgModule } from '@angular/core';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
// no icons detected automatically — add imports from '@ng-icons/lucide' below and provide them in provideIcons
import * as lucideIcons from '@ng-icons/lucide';

@NgModule({
  imports: [NgIconsModule],
  providers: [
    // Example: provideIcons({ lucideHome, lucideUser });
    // Add your icons here
    provideIcons({ ...lucideIcons }),
  ],
  exports: [NgIconsModule],
})
export class IconsModule {}
`;
    fs.writeFileSync(OUT_FILE, content, 'utf8');
    console.log('No lucide icons detected. Wrote icons.module.ts placeholder at', OUT_FILE);
    return;
  }

  const identifiers = iconNames.map(n => toIdentifier(n));
  const importList = identifiers.join(', ');
  const providerList = identifiers.join(',\n    ');

  const content = `import { NgModule } from '@angular/core';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import { ${importList} } from '@ng-icons/lucide';

@NgModule({
  imports: [NgIconsModule],
  providers: [
    provideIcons({
      ${providerList}
    }),
  ],
  exports: [NgIconsModule],
})
export class IconsModule {}
`;
  fs.writeFileSync(OUT_FILE, content, 'utf8');
  console.log('Wrote icons.module.ts with', identifiers.length, 'icons to', OUT_FILE);
}

function replaceTags(files, iconNames) {
  const lucideTagRegex = /<\s*lucide-icon([^>]*)name\s*=\s*["']([^"']+)["']([^>]*)>/gi;
  files.forEach(f => {
    if (f.endsWith('.html')) {
      let content = fs.readFileSync(f, 'utf8');
      let changed = false;
      content = content.replace(lucideTagRegex, (match, before, name, after) => {
        const id = toIdentifier(name);
        changed = true;
        // keep other attributes but replace tag and name value
        return `<ng-icon${before}name="${id}"${after}>`;
      });
      if (changed) {
        fs.writeFileSync(f, content, 'utf8');
        console.log('Patched:', f);
      }
    }
  });
}

function main() {
  const files = walk(SRC);
  const iconNames = findLucideIcons(files);
  generateModule(iconNames);

  // optional: apply replacements automatically
  // enable auto-replace by passing --apply
  if (process.argv.includes('--apply')) {
    replaceTags(files, iconNames);
    console.log('Applied template replacements: <lucide-icon> -> <ng-icon> with lucide prefix');
  } else {
    console.log('To auto-replace templates (recommended), re-run with --apply:');
    console.log('  node tools/generate-icons.js --apply');
  }
}

main();

