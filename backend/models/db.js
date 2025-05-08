const mongoose = require('mongoose');


const DB_URL= process.env.DB_URL;

mongoose
.connect(DB_URL)
.then(() => {
 console.log(`Backend DataBase Ready To Use`);
})
.catch((err) => {
 console.log(err);
});
