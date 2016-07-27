interface Account { // Interface for each person's account
    net :number;
    transactions :Transaction[];
}

interface Transaction { // Interface for all the transactions of each person.
    credit :boolean;
    amount :number
    date :string;
    narrative :string;
}

var peopleAccounts = {} // Dictionary of people, with their names as the keys to access their accounts

// Input the file and parse it into an array of lines:
var fs = require('fs');
var text = fs.readFileSync('Transactions2014.csv','utf8',(err,data) => {
    if err throw err;
    return data;
})
var lines = text.split('\r\n');

// Process each line to produce all the accounts and update their transactions accordingly
var len = lines.length;
for (var i=1; i<len-1; i++) { // From second line to second last. There is a header line first, and an empty line last.
    var details = lines[i].split(',');

    var fromPerson = details[1];
    if (!peopleAccounts.hasOwnProperty(fromPerson)) {
        peopleAccounts[fromPerson] = {net: 0.0, transactions: []};
    }
    peopleAccounts[fromPerson].net -= parseFloat(details[4]);
    peopleAccounts[fromPerson].transactions.push({
        credit: false, amount: parseFloat(details[4]), date: details[0], narrative: details[3]
    })

    var to = details[2];
    if (!peopleAccounts.hasOwnProperty(to)) {
        peopleAccounts[to] = {net: 0.0, transactions: []};
    }
    peopleAccounts[to].net += parseFloat(details[4]);
    peopleAccounts[to].transactions.push({
        credit: true, amount: parseFloat(details[4]), date: details[0], narrative: details[3]
    })
}

function printPeopleBalances { // Prints everyone's account balances
    for (var person in peopleAccounts) {
        console.log(person + ': ' + peopleAccounts[person].net);
    }
}

function printPersonsTransactions(person :string) {// Prints all the transactions for a given person
    if (peopleAccounts.hasOwnProperty(person)) {
        console.log(person + ':');
        var pT = peopleAccounts[person].transactions;
        var pTlen = pT.length;
        for (var i=0; i<pTlen; i++) {
            var transaction = pT[i];
            if (pT[i].credit) {
                console.log('Credit of ' + transaction.amount + ', dated ' + transaction.date + ', for reason: ' + transaction.narrative + '.');
            } else {
                console.log('Debit of ' + transaction.amount + ', dated ' + transaction.date + ', for reason: ' + transaction.narrative + '.');
            }
        }
    } else {
        console.log('Person not found.');
    }
}
console.log(peopleAccounts['Dan W']);

const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Ask the user for command line instructions
function prompting() {
    console.log("Prompting");
    var mString = "Enter a command. 'List_All' to show everyone's balances. 'List_Person' to list the transactions of a person, chosen later through a menu.";
    rl.question(mString, (command) => {
        switch(command) {
            case 'List_All':
                printPeopleBalances();
                console.log("Printed");
                break;
            case 'List_Person':
                rl.question('Whose account do you wish to see?', (name) => {
                    printPersonsTransactions(name);
                });
                break;
            default:
        }
        prompting();
    });
}

prompting();