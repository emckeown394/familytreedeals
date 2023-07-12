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
app.use(session({
    secret: 'web-dev-2023', 
    resave: false,
    saveUninitialized: true
  }));
  


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

app.get('/logged', function(req, res) {
    if (req.session.loggedin) {
      // User is logged in, render logged_index page
      res.render('logged_index');
    } else {
      // User is not logged in, redirect to the login page
      res.redirect('/login');
    }
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

app.get("/daysout", (req,res) => {
    res.render('daysout');
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

app.get("/row",(req,res) => {
    let showid = req.query.id;
    let readsql = "SELECT * FROM deals WHERE id = ?";
    connection.query(readsql,[showid],(err, rows)=>{
        if(err) throw err;
        let deals = {
            text: rows[0]['text'],
            image: rows[0]['image'],
            city: rows[0]['city'],
            info: rows[0]['info'],
            saving: rows[0]['saving'],
            url: rows[0]['url'],
            voucher: rows[0]['voucher'],
            company: rows[0]['company'],
            category: rows[0]['category'],
            rrp: rows[0]['rrp']
        };
        res.render('deals',{deals})
    });
});


// signup/login
app.use(cookieParser());

app.use(session({
    secret : 'web-dev-2023',
    resave : true,
    saveUninitialized : true
}));
app.use(express.urlencoded({extended: 'true'}));
app.use(express.json());

app.post('/signup', (req, res) => {
    const { name, email, username, password } = req.body;
  
    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);
  
    // Insert user into the database
    db.query(
      `INSERT INTO members (name, email, username, password) VALUES (?, ?, ?, ?)`,
      [name, email, username, hashedPassword],
      (err) => {
        if (err) {
          console.error(err);
          res.send('An error occurred during signup.');
        } else {
          res.redirect('/login');
        }
      }
    );
  });

  app.post('/login', function(req, res) {
    let username = req.body.username;
    let password = req.body.password;
  
    if (username && password) {
      connection.query(
        'SELECT * FROM members WHERE username = ?',
        [username],
        function(error, rows, fields) {
          if (error) throw error;
          let numrows = rows.length;
  
          if (numrows > 0) {
            const storedPassword = rows[0].password;
            bcrypt.compare(password, storedPassword, function(err, result) {
              if (err) throw err;
  
              if (result) {
                req.session.loggedin = true;
                req.session.username = username;
                res.redirect('/logged');
              } else {
                res.send('<code>Incorrect Username and/or Password</code> <a href="/login" class="button">BACK</a>');
              }
            });
          } else {
            res.send('<code>Incorrect Username and/or Password</code> <a href="/login" class="button">BACK</a>');
          }
        }
      );
    } else {
      res.send('Enter Username and Password');
    }
  });
  
  
//server
app.listen(process.env.PORT || 3000);
console.log(" Server is listening on //localhost:3000/ ");