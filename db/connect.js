const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost:27017/restaurantUser', { useNewUrlParser: true, useUnifiedTopology: true})
//     .then(() => console.log('we are connected'))
//     .catch(e => { console.log(e) })


main().then(()=> console.log('connected'))
.catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://localhost:27017/restaurantUser');
}