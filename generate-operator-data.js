// This script will generate a JSON file with all operator data
// Run this script with Node.js after installing the r6operators package

// Import the r6operators package
const r6operators = require('r6operators');
console.log(r6operators);


// Write the data to a JSON file
const fs = require('fs');
fs.writeFileSync(
    'operator-data.json', 
    JSON.stringify(r6operators, null, 2)
);
console.log('Operator data has been saved to operator-data.json'); 