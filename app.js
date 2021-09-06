require('dotenv').config()
const express = require('express');
const app = express();
const path = require('path')
require('./db/connect')
const User = require('./models/models')
const bcrypt = require('bcryptjs');
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);
const {auth, isUnAuthenticated} = require('./middleware/auth');
const local = require('./middleware/setLocal')


const port = process.env.PORT || 8000;

// setting ejs as template engine
app.set('view engine', 'ejs');

// serving static file
app.use(express.static(path.join(__dirname, 'public')))

// storing cookie
const store = new MongoDBStore({
    uri: 'mongodb://localhost:27017/restaurantUser' ,
    collection: 'mySessions'
  });

// using middleware 
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: store
  }))
app.use(local)


// home page
app.get('/', (req, res)=>{
    res.render('index.ejs', {title: "Home"})
})

// about page
app.get('/about', (req, res)=>{
    res.render('about.ejs', {title: "About"})
})

// gallery page
app.get('/gallery', (req, res)=>{
    res.render('gallery.ejs', {title :"Gallery"})
})

// book a table page
app.get('/bookTable', auth, (req, res)=>{
    res.render('bookTable.ejs', {title : "Book a Table"})
})


// login page 
app.get('/login', isUnAuthenticated, (req, res)=>{
    res.render('login.ejs',{title : "Log-in"})
})

// sign up page
app.get('/signup', isUnAuthenticated, (req, res)=>{
    res.render('signup.ejs', {title : "Sign-Up"})
})

// all post request

// post request of book a table page
app.post('/bookTable', auth, async (req , res)=>{
    try {
        const userList = new User(req.body)
        const {name, mobile, email, date, time , person} = req.body;
        console.log(`${name} is ${mobile}`)
        let errors = [];

        if(!name || !mobile || !email || !date || !time || !person){
            errors.push({ msg: "Please fill all the field" })
        }
        if(mobile.length < 10){
            errors.push({ msg: "Mobile number should be at least 10 characters " })
        }
        if(errors.length > 0){
            res.render('booktable', {
                title: "Book a Table", 
                errors, 
                name,
                mobile,
                email,
                date,
                time,
                person
            })
        } else{
             // saving user data into database
             const saveUser = await userList.save()
             res.render('index.ejs', {title: "Home"})
        }
    } catch (error) {
        console.log(error)
    }
})


// post request of signup page
app.post('/signup', isUnAuthenticated, async (req, res)=>{
    try {
        const userList = new User(req.body)
        const { name, email, mobile, password, confirmpassword } = req.body;
        let errors = []

        if (!name || !mobile || !email || !password || !confirmpassword) {
            errors.push({ msg: "Please fill all the field" })
        }
        if(mobile.length < 10){
            errors.push({ msg: "Mobile number should be at least 10 characters " })
        }
        if (password !== confirmpassword) {
            errors.push({ msg: "Password doesn't match" })
        }
        if (password.length < 6) {
            errors.push({ msg: "Password should be at least 6 characters " })
        }

        // if user is already registerd
        let isRegisterd = await User.findOne({ email: email })
        if (isRegisterd) {
            errors.push({ msg: 'Email is already registered' })
            res.render('signup', {
                title: "Sign-Up",
                errors,
                name,
                mobile,
                email,
                password,
                confirmpassword
            })
        }

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
            // hashing password before saving

            // saving user data into database
            const saveUser = await userList.save()
            res.render('login', { title: 'Login' })
        }

    } catch (error) {
        console.log(error)
    }
})


// post request of login page
app.post('/login', isUnAuthenticated, async (req, res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
        // console.log(`${email} is ${password}`)
        const errors = []
    
        // getting the right user throw eamil
        let findUser = await User.findOne({ email: email })
        if (!findUser) {
            errors.push({ msg: 'Inavalid Login Information...Try Again' })
            res.render('login', {
                title: 'Login',
                errors,
                email,
                password
            })
        }
        
        // getting the right user throw password
        let userPassword = await bcrypt.compare(password, findUser.password)
        if (!userPassword) {
            errors.push({ msg: 'Inavalid Login Information...Try Again' })
            res.render('login', {
                title: 'Login',
                errors,
                email,
                password
            })
        }
    
        req.session.isLoggedIn = true;
        req.session.user = findUser;
    
        if (findUser || userPassword) {
            res.redirect('/bookTable')
        }
    } catch (error) {
        console.log(error)
    }
    
})

// all cuisine page

// thai cuisine page
app.get('/thai', (req, res)=>{
    res.render('thai.ejs' , {title : "Thai Cuisine"})
})

// indian cuisine page
app.get('/indian', (req, res)=> {
     res. render('indian.ejs', {title: "Indian Cuisinen"})
})

// continental cuisine page
app.get('/continental', (req, res)=>{
    res.render('continental.ejs', {title : "Continental Cuisine"})
})

// desert & drinks page 
app.get('/desert' , (req, res)=>{
    res.render('desert.ejs' , {title : "Desert & Drinks"})
})

// logout page
app.get('/logout', auth,(req, res)=>{
    req.session.destroy(err=>{
        if(err){
            console.log(err)
        } 
        return res.redirect('/login')
    })
})


// error page
app.get('/*',(req, res)=>{
    res.render('notfound.ejs', {title: "Error"})
})


app.listen(port, () => {
    console.log(`Server running at ${port}`);
  });