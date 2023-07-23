const express = require("express");
let app = express();
const connection = require("./connection.js");
const mysql  = require('mysql');
const session = require('express-session');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
//for hashing passwords
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const { name } = require("ejs");


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
app.use(bodyParser.urlencoded({ extended: true}));
  


app.get("/", (req,res) => {
  const loggedin = req.session.loggedin || false;
    res.render('index', {loggedin});
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
  let sessionobj = req.session;
  if(sessionobj.authen){
    res.render('logged_index');
  } else {
    res.render('index');
  }
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

app.get("/post_deals", (req,res) => {
  res.render('post_deals');
});

app.get("/post_vouchers", (req,res) => {
  res.render('post_vouchers');
});

app.get("/product", (req, res) => {
  let readsql = "SELECT id, text, city, info, saving, url, voucher, company, member_id, image, rrp FROM deals";
  connection.query(readsql, (err, rows) => {
    try {
      if (err) throw err;
      let rowdata = rows;
      res.render('product', { title: 'Product', rowdata });
    } catch (err) {
      console.error(err);
      res.status(500).send('Failed to load vouchers');
    }
  });
});



// app.get("/product", function (req,res) {
//   let city = req.query.city || "";
//   let saving = req.query.saving || "";
//   let category = req.query.category || "";

//   let sql = `SELECT deals.text, deals.city, deals.info, deals.saving, deals.url, 
//               deals.voucher, deals.company, deals.category, deals.user_id, deals.image, deals.rrp
//               FROM deals
//             WHERE deals.city LIKE ?
//             AND deals.saving LIKE ?
//             AND deals.category LIKE ?`;

//   let values = [`%${city}%`, `%${saving}%`, `%${category}%`];

//   connection.query(sql, values, function (err, rows) {
//     if (err) throw err;
//     res.render("product", {
//       deals:
//         rows,
//       city: city,
//       saving: saving,
//       category: category,
//     });
//   });
// });

// All Deals
app.get("/alldeals",(req,res) => {
    let readsql = "SELECT id, text, city, info, saving, url, voucher, company, member_id, image, rrp FROM deals";
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

app.get("/entertainment-deals", (req,res) => {
  let showid = req.query.id;
  let readsql = "SELECT * FROM `deals` WHERE `category` = 'Entertainment';";
  connection.query(readsql,(err, rows)=>{
    if(err) throw err;
    let rowdata = rows;
    res.render('entertainment-deals',{title: 'Entertainment Deals', rowdata});
  });      
});

app.get('/daysout', (req, res) => {
  let readsql = "SELECT * FROM `deals` WHERE `category` = 'Days out';";
  connection.query(readsql, (err, rows) => {
    if (err) {
      console.error(err);
      res.send('An error occurred while fetching days out deals.');
    } else {
      let rowdata = rows;
      res.render('daysout', { title: 'Days Out Deals', rowdata });
    }
  });
});

app.get('/groceries-deals', (req, res) => {
  let readsql = "SELECT * FROM `deals` WHERE `category` = 'groceries';";
  connection.query(readsql, (err, rows) => {
    if (err) {
      console.error(err);
      res.send('An error occurred while fetching groceries deals.');
    } else {
      let rowdata = rows;
      res.render('groceries-deals', { title: 'Groceries Deals', rowdata });
    }
  });
});

app.post('/submit-deal', (req, res) => {
  const { deal, city, info, saving, url, voucher, company, category, image, rrp } = req.body;

  // const memberID = req.session.memberID;

  // db.query(
  //   `SELECT memberID FROM members WHERE id = ?`,
  //   [memberID],
  //   (err, result) => {
  //     if (err) {
  //       console.error(err);
  //       res.send('An error occurred during posting deal.');
  //     } else {
  //       const memberID = result[0].memberID;

        // Insert deal into the database
        db.query(
          `INSERT INTO deals (text, city, info, saving, url, voucher, company, category, image, rrp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [deal, city, info, saving, url, voucher, company, category, image, rrp],
          (err) => {
            if (err) {
              console.error(err);
              res.send('An error occurred during posting deal.');
            } else {
              res.redirect('/post_deals');
            }
          }
        );
      
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

  app.get('/logout', (req, res) => {
    req.session.destroy();
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
  
  
//server
app.listen(process.env.PORT || 3000);
console.log(" Server is listening on //localhost:3000/ ");