// Logging preamble
var winston = require('winston');
winston.level = 'debug';
winston.add(winston.transports.File, {filename: 'SoftBankNew2Problems.log' });
winston.remove(winston.transports.Console);

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

function printPersonsTransactions(person :string) {// Prints all the transactions for a given person
    if (peopleAccounts.hasOwnProperty(person)) {
        console.log(person + ':');
        var bal = peopleAccounts[person].net;
        console.log('Your balance is: ' + bal + '.');
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
};

var peopleAccounts = {} // Dictionary of people, with their names as the keys to access their accounts

// Input the file and parse it into an array of lines:
var fs = require('fs');
var text = fs.readFileSync('DodgyTransactions2015.csv','utf8',(err,data) => {
    if (err) throw err;
    return data;
})
var lines = text.split('\r\n');

// Process each line to produce all the accounts and update their transactions accordingly
var len = lines.length;
for (var i=1; i<len-1; i++) { // From second line to second last. There is a header line first, and an empty line last.
    var details = lines[i].split(',');
    var dateString = details[0]
    var fromPerson = details[1];
    var to = details[2];
    var narr = details[3];
    var amt = parseFloat(details[4]);

    var dateFormat = /\b(0[1-9]|1[1-9]|2[1-9]|30|31)\/(0[1-9]|1[0-2])\/[1-2][0-9][0-9][0-9]\b/;


    if (isNaN(amt)) {
        winston.log('error', 'You have entered an invalid trasaction, becuase you have entered ' + details[4] + ' as the amount, which is not valid. This transaction will not be recorded.');
    } else if (!dateFormat.test(dateString)) {
        winston.log('error', 'You have entered an invalid trasaction, becuase you have entered ' + dateString + ' as the date, which is not a valid format. This transaction will not be recorded. For future reference, please enter the date in a dd/mm/yyyy format');
    } 
    else {
    if (!peopleAccounts.hasOwnProperty(fromPerson)) {
        peopleAccounts[fromPerson] = {net: 0.0, transactions: []};
    }
    peopleAccounts[fromPerson].net -= amt;
    peopleAccounts[fromPerson].transactions.push({
        credit: false, amount: amt, date: details[0], narrative: details[3]
    })

    if (!peopleAccounts.hasOwnProperty(to)) {
        peopleAccounts[to] = {net: 0.0, transactions: []};
    }
    peopleAccounts[to].net += amt;
    peopleAccounts[to].transactions.push({
        credit: true, amount: amt, date: details[0], narrative: details[3]
    })
    }
}

function printPeopleBalances() { // Prints everyone's account balances
    for (var person in peopleAccounts) {
        console.log(person + ': ' + peopleAccounts[person].net);
    }
}

// Ask the user for command line instructions
var readlineSync = require('readline-sync');
var command = '';
var personName = '';
while (command != 'Quit') {
    command = readlineSync.question("Enter a command. 'List_All' to show everyone's balances. 'List_Person' to list the transactions of a person, chosen later through a menu. 'Quit' to quit: ");
    switch (command) {
        case 'List_All':
            printPeopleBalances();
            console.log();
            break;
        case 'List_Person':
            personName = readlineSync.question('Whose Account do you wish to see: ');
            printPersonsTransactions(personName);
            console.log();
            break;
        case 'Quit':
            console.log('Quit successful');
            break;
        default:
            console.log('Sorry, invalid input. Please try again.');
    }
}
