const fs = require('fs');
var util = require('util');
var _ = require('lodash');

var log_file = fs.createWriteStream(__dirname + '/debug.log', {flags : 'w'});
var log_stdout = process.stdout;

// NOTE: Overloading the console.log to go to the debug file
console.log = function(d) { 
  log_file.write(util.format(d) + '\n');
  log_stdout.write(util.format(d) + '\n');
};

let rawLeadsData = fs.readFileSync('data/leads.json');
let data = JSON.parse(rawLeadsData);

console.log(
`
ORIGINAL DATA
-------------
${rawLeadsData}

`);


// Chooses the index we will remove on a matching pair
const chooseOlderEntryIndexOrLowestIndex = (indexA, indexB) => {
    const dateA = (new Date(data.leads[indexA].entryDate)).getTime();
    const dateB = (new Date(data.leads[indexB].entryDate)).getTime();

    // Date
    if (dateA < dateB) {
        return indexA;
    }
    else if (dateA > dateB) {
        return indexB;
    }
    // Index
    else if (indexA > indexB) {
        indexB;
    }
    else {
        return indexA;
    }
}

const logChange = (reason, keeping, removing) => {
    console.log(
        `${reason}
----------------------
KEEPING:
${JSON.stringify(keeping)}
REMOVING:
${JSON.stringify(removing)}\n\n`);
}

// Going backwards through our leads so when we remove elements it won't matter
for (var leadIndex = data.leads.length - 1; leadIndex >= 0; leadIndex--) {
    const matchingIdIndex = _.findIndex(data.leads, (lead) => lead._id === data.leads[leadIndex]._id);

    if (matchingIdIndex !== leadIndex) {
        const indexToRemove = chooseOlderEntryIndexOrLowestIndex(matchingIdIndex, leadIndex);
        logChange("Duplicate _ID",
            indexToRemove === matchingIdIndex ? data.leads[leadIndex] : data.leads[matchingIdIndex],
            indexToRemove === matchingIdIndex ? data.leads[matchingIdIndex] : data.leads[leadIndex]);
        var removed = data.leads.splice(indexToRemove, 1);
    }
}
for (var leadIndex = data.leads.length - 1; leadIndex >= 0; leadIndex--) {
    const matchingEmailIndex = _.findIndex(data.leads, (lead) => lead.email === data.leads[leadIndex].email);

    if (matchingEmailIndex !== leadIndex) {
        const indexToRemove = chooseOlderEntryIndexOrLowestIndex(matchingEmailIndex, leadIndex);
        logChange("Duplicate email",
            indexToRemove === matchingEmailIndex ? data.leads[leadIndex] : data.leads[matchingEmailIndex],
            indexToRemove === matchingEmailIndex ? data.leads[matchingEmailIndex] : data.leads[leadIndex]);
        var removed = data.leads.splice(indexToRemove, 1);
    }
}

console.log("NEW LEADS JSON");
console.log(data);