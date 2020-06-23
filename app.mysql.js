/* WIREFRAME:
    const items = [];
    items.push( {
        name: "item name",
        desc: "stuff about this",
        maxBid: 0,
        maxBidName : ""
    });

    while( 1 ){

    }
    Ask for user-name and if
       * Post An Item 
       * Bid on an Item)
        |
        |___  POST AN ITEM
           * Ask for Item name, description
           * Save to an array.
        |
        |
        |___ BID ON AN ITEM
           * Show list of items (retrieve from array)
           * User will pick one item
                * then prompt user for their maximum price
                * then compare their maximum price with already max price.
                    * if user has higher bid, replace maxBid + maxBidName with this user  
        | REPEAT

        CREATE TABLE items (
            `item`      VARCHAR(100) PRIMARY KEY,
            `desc`      VARCHAR(255),
            `maxBid`    DECIMAL(4,2) DEFAULT 0,
            `maxBidName` VARCHAR(30) DEFAULT "",
        )
        */
const inquirer = require( 'inquirer' );
const mysql = require( 'mysql' );

class Database {
    constructor( config ) {
        this.connection = mysql.createConnection( config );
    }
    query( sql, args=[] ) {
        return new Promise( ( resolve, reject ) => {
            this.connection.query( sql, args, ( err, rows ) => {
                if ( err )
                    return reject( err );
                resolve( rows );
            } );
        } );
    }
    close() {
        return new Promise( ( resolve, reject ) => {
            this.connection.end( err => {
                if ( err )
                    return reject( err );
                resolve();
            } );
        } );
    }
  }
// at top INIT DB connection
const db = new Database({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "r00tr00t",
    database: "ebay"
  });''

let promptAnswers;
let userName = "";

async function main(){
    promptAnswers = await inquirer.prompt([
        { name: 'userName', type: 'input', message: 'What is your bidder-name?' }
    ]);
    userName = promptAnswers.userName;

    // loop through the prompting bid/post
    while( 1 ){
        console.log( `========================` );
        promptAnswers = await inquirer.prompt([ 
            { name: 'action', type: 'list', message: 'What do you want to do?',
            choices: [ "Bid on an Item", "Post an Item" ] }
        ]);

        // logic now on whether bidding or posting
        if( promptAnswers.action=='Post an Item' ){
            promptAnswers = await inquirer.prompt([
                { name: 'item', type: 'input', message: 'What is the name of the item?' },
                { name: 'desc', type: 'input', message: 'Describe the item please' },
            ]);
            // since it has the fields we want, we can be lazy and just post the object
            await db.query( "INSERT INTO items (`item`,`desc`) VALUES(?,?)", [promptAnswers.item, promptAnswers.desc] );
            
        } else {
            // get the list of items we can bid on
            let choiceList = await db.query( "SELECT item FROM items" );
            let choices = choiceList.map( itemObj=>itemObj.item );

            if( choices.length<1 ){
                console.log( "Sorry nothing to bid on, so let's enter something first, hmm?\n\n" );
                continue;
            }

            promptAnswers = await inquirer.prompt([
                { name: 'item', type: 'list', message: "\nWhat do you want to bid on:",
                choices: choices }
            ]);

            let itemName = promptAnswers.item;

            promptAnswers = await inquirer.prompt([
                { name: 'userBid', type: 'input', message: `How much to bid on ${itemName}?` }
            ]);
            // now check if they are the high bidder
            let checkMaxBid = await db.query( "SELECT maxBid FROM items WHERE item=?", itemName );
            // remember it returns array with an object --> [ { maxBid: 6 }]
            // so to get just the number we do this:
            checkMaxBid = checkMaxBid[0].maxBid;
            console.log( `returned result: `, checkMaxBid );

            if( promptAnswers.userBid > checkMaxBid ){
                await db.query( "UPDATE items SET maxBid=?,maxBidName=? WHERE item=?", [promptAnswers.userBid, userName,itemName] );

                console.log( `CONGRATS! You (${userName}) are the high bidder on ${itemName}!` );
            } else {
                console.log( `Sorry dawg! Your bid (${promptAnswers.userBid}) was too low (current: ${checkMaxBid}). Try again another time` );
            }            
        } // end of bid/post logic
    } // end while
}; // /main

main();