const express = require("express");
let app = express();
const connection = require("./connection.js");
const mysql  = require('mysql');
const session = require('express-session');
const dotenv = require('dotenv');
//for hashing passwords
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');


// Database connection
let db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'familytreedeals',
    port: '3306'
});

db.connect((err)=> {
    if(err) throw err;
});



//middleware
app.set('view engine', 'ejs');
app.use(express.static(__dirname,+ "/public"));


app.get("/", (req,res) => {
    res.render('index');
});

app.get("/signup", async (req,res) => {
    res.render('signup');
});

app.get("/login", async (req,res) => {
    res.render('login');
});

app.get("/contact", (req,res) => {
    res.render('contact');
});

app.get("/vouchers", (req,res) => {
    res.render('vouchers');
});

app.get("/privacy", (req,res) => {
    res.render('privacy');
});

app.get("/logged", (req,res) => {
    res.render('logged_index');
});

app.get("/logged_index", (req,res) => {
    res.render('logged_index');
});

app.get("/deals", (req,res) => {
    res.render('deals');
});

app.get("/lidl_vouchers", (req,res) => {
    res.render('lidl_vouchers');
});

app.get("/pizza_hut_vouchers", (req,res) => {
    res.render('pizza_hut_vouchers');
});

app.get("/amazon_vouchers", (req,res) => {
    res.render('amazon_vouchers');
});

app.get("/cineworld_vouchers", (req,res) => {
    res.render('cineworld_vouchers');
});

app.get("/tesco_vouchers", (req,res) => {
    res.render('tesco_vouchers');
});

// All Deals
app.get("/alldeals",(req,res) => {
    let readsql = "SELECT id, text, city, info, saving, url, voucher, company, user_id, image, rrp FROM deals";
    connection.query(readsql,(err, rows)=>{
        if(err) throw err;
        let rowdata = rows;
        res.render('alldeals',{title: 'All Deals', rowdata});
    });
});


// signup/login
app.use(cookieParser());

app.use(session({
    secret : 'secret',
    resave : true,
    saveUninitialized : true
}));
app.use(express.urlencoded({extended: 'true'}));
app.use(express.json());

app.post('/signup', (req,res) => {
    const {name, email, password, password_confirm } = req.body;

    let checkuser = 'SELECT * FROM users WHERE name = ? ';

    db.query('SELECT email FROM users WHERE email = ?', [email], async (error, res) => {
        if(error){
            console.log(error)
        }
        
        //inserting into db
        let hashedPassword = await bcrypt.hash(password, 8)

        db.query('INSERT INTO users SET?', {name: name, email: email, password: hashedPassword}, (err, res) => {
            if(error) {
                console.log(error)
            } else {
                return res.redirect('signup')
            }
        });
    });
        
       
});

app.post('/login', function(req, res){
    let email = req.body.email;
    let password = req.body.password;
    if (email && password){
        connection.query('SELECT * FROM users WHERE email = ? AND password = ?',[email, password], function(error, rows, fields){
            if (error) throw error;
            let numrows = rows.length;
            if (numrows > 0){
                req.session.loggedin = true;
                req.session.email = email;
                res.redirect('logged');
            }else{
                res.send('<code>Incorrect Email and/or Password</code> <a href="login" class="button">BACK</a>');
            }
            res.end();
        });
    }else{
        res.send('Enter Email and Password');
        res.end();
    }
});





//server
app.listen(process.env.PORT || 3000);
console.log(" Server is listening on //localhost:3000/ ");