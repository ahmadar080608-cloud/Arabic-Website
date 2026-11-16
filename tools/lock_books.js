// Encrypts the private book files so they can sit in the public repo unreadable: node tools/lock_books.js PASSWORD file1.json file2.json
const crypto=require('crypto'), fs=require('fs');
const [pw,...files]=process.argv.slice(2);
const books=files.map(f=>JSON.parse(fs.readFileSync(f,'utf8')));
const salt=crypto.randomBytes(16), iv=crypto.randomBytes(12);
const key=crypto.pbkdf2Sync(pw,salt,200000,32,'sha256');
const c=crypto.createCipheriv('aes-256-gcm',key,iv);
const enc=Buffer.concat([c.update(JSON.stringify(books),'utf8'),c.final(),c.getAuthTag()]);
fs.writeFileSync(__dirname+'/../books/library.enc',JSON.stringify({v:1,salt:salt.toString('base64'),iv:iv.toString('base64'),data:enc.toString('base64'),n:books.length}));
console.log('locked',books.length,'books');
