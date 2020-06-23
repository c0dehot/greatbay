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
        */
const inquirer = require( 'inquirer' );

let promptAnswers;
let userName = "";

const items = [
    { item: "macbook",
      desc: "cool computer",
      maxBid: 0,
      maxBidName : "" },
    { item: "parrot",
      desc: "best pet ever, can talk too!",
      maxBid: 0,
      maxBidName : "" },      
];

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
            choices: [ "Bid on an Item", "Post an Item", "Quit" ] }
        ]);

        // logic now on whether bidding or posting
        if( promptAnswers.action=='Quit' ){
            console.log( `Thanks for using me. Please come again!` );
            process.exit(0);

        } else if( promptAnswers.action=='Post an Item' ){
            promptAnswers = await inquirer.prompt([
                { name: 'item', type: 'input', message: 'What is the name of the item?' },
                { name: 'desc', type: 'input', message: 'Describe the item please' },
            ]);
            // since it has the fields we want, we can be lazy and just post the object
            items.push( {
                item: promptAnswers.item,
                desc: promptAnswers.desc,
                maxBid: 0,
                maxBidName: "" } );

        } else {
            // get the list of items we can bid on
            let choices = [];
            items.forEach( function( itemObj ){
                choices.push( itemObj.item );
            })

            if( choices.length<1 ){
                console.log( "Sorry nothing to bid on, so let's enter something first, hmm?\n\n" );
                continue;
            }

            promptAnswers = await inquirer.prompt([
                { name: 'item', type: 'list', message: "\nWhat do you want to bid on:",
                choices }
            ]);

            // now filter and just get item that has this name
            let biddingItemIdx = items.findIndex( itemObj => itemObj.item == promptAnswers.item )
            let itemName = items[biddingItemIdx].item;

            promptAnswers = await inquirer.prompt([
                { name: 'userBid', type: 'input', message: `How much to bid on ${itemName}?` }
            ]);
            // now check if they are the high bidder
            if( promptAnswers.userBid > items[biddingItemIdx].maxBid ){
                items[biddingItemIdx].maxBid = promptAnswers.userBid;
                items[biddingItemIdx].maxBidName = userName;

                console.log( `CONGRATS! You (${userName}) are the high bidder on ${itemName}!` );
            } else {
                console.log( `Sorry dawg! Your bid was too low. Try again another time` );
            }            
        } // end of bid/post logic
    } // end while
}; // /main

main();