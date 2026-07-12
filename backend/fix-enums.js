const fs = require('fs');
const path = require('path');

const enumsCode = `
export enum RoleName { FLEET_MANAGER = 'FLEET_MANAGER', DRIVER = 'DRIVER', SAFETY_OFFICER = 'SAFETY_OFFICER', FINANCIAL_ANALYST = 'FINANCIAL_ANALYST' }
export enum VehicleType { TRUCK = 'TRUCK', VAN = 'VAN', BIKE = 'BIKE' }
export enum VehicleStatus { AVAILABLE = 'AVAILABLE', ON_TRIP = 'ON_TRIP', IN_SHOP = 'IN_SHOP', RETIRED = 'RETIRED' }
export enum DriverStatus { AVAILABLE = 'AVAILABLE', ON_TRIP = 'ON_TRIP', OFF_DUTY = 'OFF_DUTY', SUSPENDED = 'SUSPENDED' }
export enum TripStatus { DRAFT = 'DRAFT', DISPATCHED = 'DISPATCHED', COMPLETED = 'COMPLETED', CANCELLED = 'CANCELLED' }
export enum MaintenanceStatus { ACTIVE = 'ACTIVE', CLOSED = 'CLOSED' }
export enum ExpenseCategory { TOLL = 'TOLL', MAINTENANCE = 'MAINTENANCE', FUEL = 'FUEL', OTHER = 'OTHER' }
`;
fs.writeFileSync('src/prisma-enums.ts', enumsCode);

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
};

const enums = ['RoleName', 'VehicleType', 'VehicleStatus', 'DriverStatus', 'TripStatus', 'MaintenanceStatus', 'ExpenseCategory'];

const files = walk('src');
files.push('prisma/seed.ts');

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;
  
  if (content.includes('@prisma/client')) {
    let importedEnums = [];
    enums.forEach(e => {
      if (content.match(new RegExp('\\b' + e + '\\b'))) {
        importedEnums.push(e);
      }
    });
    
    if (importedEnums.length > 0) {
      // Find the @prisma/client import
      const importRegex = /import\s+\{([^}]+)\}\s+from\s+['"]@prisma\/client['"]/g;
      content = content.replace(importRegex, (match, p1) => {
        let imports = p1.split(',').map(i => i.trim());
        let keep = imports.filter(i => !enums.includes(i));
        if (keep.length > 0) {
           return `import { ${keep.join(', ')} } from '@prisma/client'`;
        }
        return '';
      });
      
      // Calculate relative path to src/prisma-enums.ts
      let relative = path.relative(path.dirname(f), 'src/prisma-enums.ts');
      relative = relative.replace(/\\/g, '/');
      if (!relative.startsWith('.')) relative = './' + relative;
      relative = relative.replace('.ts', '');
      
      const newImport = `import { ${[...new Set(importedEnums)].join(', ')} } from '${relative}';\n`;
      content = newImport + content;
      changed = true;
    }
  }
  
  if (changed) fs.writeFileSync(f, content);
});
