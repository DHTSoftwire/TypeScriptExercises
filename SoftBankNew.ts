var readlineSync = require('readline-sync')
var winston = require('winston');
var lines = require('./Transactions2013.json');

// LOGGING:

winston.level = 'debug';
winston.add(winston.transports.File, {filename: 'SoftBankNew2Problems.log' });
winston.remove(winston.transports.Console);

// ITNERFACES:

// Interface for each person's account
interface Account {
    balance :number;
    transactions :Transaction[];
}

// Interface for all the transactions of each person.
interface Transaction { 
    from :string; //Other person involved in the transaction
    to: string;
    amount :number;
    date :string;
    narrative :string;
}

// METHODS:

/\b[1-2][0-9][0-9][0-9]-(0[1-9]|1[0-2])-(0[1-9]|1[1-9]|2[1-9]|30|31)T00-00-00\b/

// Parses the transactionLine and alter both the creditor and the debtor
function processTransaction(transactionLine: string) :void {
    var details = transactionLine.split(',');
    var dateString = details[0]
    var fromPerson = details[1];
    var toPerson = details[2];
    var narr = details[3];
    var amt = parseFloat(details[4]);
    if (isNaN(amt)) {
        winston.log('error', 'You have entered an invalid trasaction, becuase you have entered ' + details[4] + ' as the amount, which is not valid. This transaction will not be recorded.');
    } else if (!/\b[1-2][0-9][0-9][0-9]-(0[1-9]|1[0-2])-(0[1-9]|1[1-9]|2[1-9]|30|31)T00:00:00\b/.test(dateString)) {
        winston.log('error', 'You have entered an invalid trasaction, becuase you have entered ' + dateString + ' as the date, which is not a valid format. This transaction will not be recorded. For future reference, please enter the date in a dd/mm/yyyy format');
    } else {
        var thisTransaction = { from: fromPerson, to: toPerson, amount: amt, date: dateString, narrative: narr};
        alterAccount(toPerson,amt,thisTransaction); // Add credit to 'toPerson'
        alterAccount(fromPerson,-1*amt,thisTransaction); // Remove credit from 'fromPerson'
    }
};

// Function updates an account with the given transaction details
function alterAccount(accountPerson :string, amt :number, trans :Transaction) :void {
    if(!accounts.hasOwnProperty(accountPerson)) {
        accounts[accountPerson] = {balance: 0.0, transactions: []};
    }
    accounts[accountPerson].balance += amt;
    accounts[accountPerson].transactions.push(trans);
};

// Prints everyone's account balances
function printPeopleBalances() :void {
    for (var person in accounts) {
        console.log(person + ': ' + accounts[person].balance);
    }
};

// Prints all the transactions for a given person
function printPersonsTransactions(person :string) :void {
    if (accounts.hasOwnProperty(person)) {
        console.log(person + ':');
        console.log('Balance is: ' + accounts[person].balance + '.');
        var pT = accounts[person].transactions;
        for (var i=0; i<pT.length; i++) {
            var transaction = pT[i];
            console.log('From ' + transaction.from + ' to ' + transaction.to + ', dated ' + transaction.date + ', totalling ' + transaction.amount + ' for reason: ' + transaction.narrative + '.');
        }
    } else {
        console.log('Person not found.');
    }
};

// Offers command line input for the program
function commandLineInstructions() :void {
    while (command != 'Quit') {
        var command = readlineSync.question("Enter a command. 'List_All' to show everyone's balances. 'List_Person' to list the transactions of a person, chosen later through a menu. 'Quit' to quit: ");
        console.log('You command was: ' + command);
        switch (command) {
            case 'List_All':
                printPeopleBalances();
                console.log('Done!');
                break;
            case 'List_Person':
                var personName = readlineSync.question('Whose Account do you wish to see: ');
                printPersonsTransactions(personName);
                console.log('Done!');
                break;
            case 'Quit':
                console.log('Quit successful');
                break;
            default:
                console.log('Sorry, invalid input. Please try again.');
        }
    }
};

// Runs the program
function run() :void {
    for (var i=1; i<lines.length; i++) {
        var t = lines[i];
        processTransaction([t.Date,t.FromAccount,t.ToAccount,t.Narrative,t.Amount].join(','));
    };
    commandLineInstructions();
};

// SCRIPT:

var accounts = {}; // Dictionary of people, with their names as the keys to access their accounts
run();
