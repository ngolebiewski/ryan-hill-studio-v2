const argon2 = require('argon2');

async function generateHash() {
    // Put your desired password here
    const password = "<ENTER YOUR PASSWORD HERE BUT DON'T COMMIT IT TO GIT!"; 
    const hash = await argon2.hash(password, { type: argon2.argon2id });
    console.log("Your Hash:");
    console.log(hash);
}

generateHash();