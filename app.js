const express = require("express");
let app = express();
const connection = require("./connection.js");
const mysql  = require('mysql');
const session = require('express-session');
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

app.get("/collections", (req,res) => {
    res.render('collections');
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

app.get("/search", (req,res) => {
    res.render('search');
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

app.get("/rap_collection", (req,res) => {
    let showid = req.query.id;
    let readsql = "SELECT * FROM `vinyl_data_1` WHERE `subgenre` = ' Hip hop';";
    connection.query(readsql,[showid],(err, rows)=>{
        if(err) throw err;
        let vinyls = {
            album: rows[0]['album'],
            img_path: rows[0]['img_path'],
            year: rows[0]['year'],
            record_company: rows[0]['record_company'],
            tracklist: rows[0]['tracklist']
        };
        res.render('rap_collection',{vinyls})
    });
});

// All vinyls
app.get("/allvinyls",(req,res) => {
    let readsql = "SELECT * FROM vinyl_data_1";
    connection.query(readsql,(err, rows)=>{
        if(err) throw err;
        let rowdata = rows;
        res.render('all_vinyls',{title: 'All Vinyls', rowdata});
    });
});

// All vinyls logged
app.get("/all_vinyls_logged",(req,res) => {
    let readsql = "SELECT * FROM vinyl_data_1";
    connection.query(readsql,(err, rows)=>{
        if(err) throw err;
        let rowdata = rows;
        res.render('all_vinyls',{title: 'All Vinyls', rowdata});
    });
});

app.get("/row",(req,res) => {
    let showid = req.query.id;
    let readsql = "SELECT * FROM vinyl_data_1 WHERE id = ?";
    connection.query(readsql,[showid],(err, rows)=>{
        if(err) throw err;
        let vinyls = {
            album: rows[0]['album'],
            img_path: rows[0]['img_path'],
            year: rows[0]['year'],
            record_company: rows[0]['record_company'],
            tracklist: rows[0]['tracklist']
        };
        res.render('vinyls',{vinyls})
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