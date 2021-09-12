require('dotenv').config()
const express = require("express");
const app = express();
const path = require("path");
const connection = require("./db/connect");
const bcrypt = require("bcryptjs");
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const { auth, isUnAuthenticated } = require('./middleware/auth');
const local = require('./middleware/setLocal')


const port = process.env.PORT || 8000;

// setting ejs as template engine
app.set('view engine', 'ejs');

// serving static file
app.use(express.static(path.join(__dirname, 'public')))

const options = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DATABASE
};

const sessionStore = new MySQLStore(options);

// using middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: sessionStore
}))
app.use(local)


// home page
app.get('/', (req, res) => {
    res.render('index.ejs', { title: "Home" })
})

// about page
app.get('/about', (req, res) => {
    res.render('about.ejs', { title: "About" })
})

// gallery page
app.get('/gallery', (req, res) => {
    res.render('gallery.ejs', { title: "Gallery" })
})

// book a table page
app.get('/bookTable', auth, (req, res) => {
    res.render('bookTable.ejs', { title: "Book a Table" })
})


// login page 
app.get('/login', isUnAuthenticated, (req, res) => {
    res.render('login.ejs', { title: "Log-in" })
})

// sign up page
app.get('/signup', isUnAuthenticated, (req, res) => {
    res.render('signup.ejs', { title: "Sign-Up" })
})

// all post request

// post request of book a table page
app.post('/bookTable', auth, async (req, res) => {
    try {
        const { name, mobile, email, date, time, person, comment } = req.body;
        let errors = [];

        if (!name || !mobile || !email || !date || !time || !person || !comment) {
            errors.push({ msg: "Please fill all the field" })
        }
        if (mobile.length < 10) {
            errors.push({ msg: "Mobile number should be at least 10 characters " })
        }

        if (errors.length > 0) {
            res.render('booktable', {
                title: "Book a Table",
                errors,
                name,
                mobile,
                email,
                date,
                time,
                person,
                comment
            })
        } else {
            //  store data into database
            let storeData = `insert into potlucklist (name , mobile , email, date , time, person, comment) values('${name}', '${mobile}','${email}', '${date}', '${time}', '${person}', '${comment}') `;

            connection.query(storeData, async function (err, results) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("data stored");
                }
            });

            res.render('index.ejs', { title: "Home" })
        }
    } catch (error) {
        console.log(error)
    }
})


// post request of signup page
app.post('/signup', isUnAuthenticated, async (req, res) => {
    try {
        const { name, email, mobile, password, confirmpassword } = req.body;
        let errors = []

        if (!name || !mobile || !email || !password || !confirmpassword) {
            errors.push({ msg: "Please fill all the field" })
        }
        if (mobile.length < 10) {
            errors.push({ msg: "Mobile number should be at least 10 characters " })
        }
        if (password !== confirmpassword) {
            errors.push({ msg: "Password doesn't match" })
        }
        if (password.length < 6) {
            errors.push({ msg: "Password should be at least 6 characters " })
        }

        // if user is already registerd
        let getEmail = `select email from potlucklist where email = '${email}'`;
        connection.query(getEmail, (error, results) => {
            if (error) {
                console.log("error", error);
            }

            if (results.length > 0) {
                errors.push({ msg: "Email is already registered" });
            }
        });

        if (errors.length > 0) {
            res.render('signup', {
                title: "Sign-Up",
                errors,
                name,
                mobile,
                email,
                password,
                confirmpassword
            })
        } else {

            let hashPassword = await bcrypt.hash(password, 10);
            let hashConfirmPassword = await bcrypt.hash(password, 10);

            //  store data into database
            let storeData = `insert into potlucklist (name , mobile , email, password , confirmpassword) values('${name}', '${mobile}','${email}', '${hashPassword}', '${hashConfirmPassword}'  ) `;

            connection.query(storeData, async function (err, results) {
                if (err) {
                    console.log(err);
                } else {
                    console.log("data stored");
                }
            });
            res.render('login', { title: 'Login' })
        }

    } catch (error) {
        console.log(error)
    }
})


// post request of login page
app.post('/login', isUnAuthenticated, async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const errors = []

        // getting the user from database by
        let getUserEmail = `select * from potlucklist where email = '${email}'`;
        connection.query(getUserEmail, async (error, results, fields) => {
            if (error) {
                return console.log("error", error);
            }
            if (!results.length) {
                errors.push({ msg: 'Inavalid username or password...Try Again' })
                res.render('login', {
                    title: 'Login',
                    errors,
                    email,
                    password
                })
            }

            let userPassword = await bcrypt.compare(password, results[0].password)
            if (!userPassword) {
                errors.push({ msg: 'Inavalid username or password...Try Again' })
                res.render('login', {
                    title: 'Login',
                    errors,
                    email,
                    password
                })
            }

            req.session.isLoggedIn = true;
            req.session.user = results;

            if (results.length && userPassword) {
                res.redirect('/bookTable')
            }

        });
    } catch (error) {
        console.log(error)
    }

})

// all cuisine page

// thai cuisine page
app.get('/thai', (req, res) => {
    res.render('thai.ejs', { title: "Thai Cuisine" })
})

// indian cuisine page
app.get('/indian', (req, res) => {
    res.render('indian.ejs', { title: "Indian Cuisinen" })
})

// continental cuisine page
app.get('/continental', (req, res) => {
    res.render('continental.ejs', { title: "Continental Cuisine" })
})

// desert & drinks page 
app.get('/desert', (req, res) => {
    res.render('desert.ejs', { title: "Desert & Drinks" })
})

// logout page
app.get('/logout', auth, (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err)
        }
        return res.redirect('/login')
    })
})


// error page
app.get('/*', (req, res) => {
    res.render('notfound.ejs', { title: "Error" })
})


app.listen(port, () => {
    console.log(`Server running at ${port}`);
});