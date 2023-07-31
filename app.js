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

function isAuthenticated(req, res, next) {
  if (req.session.loggedin) {
    // If the user is authenticated, proceed
    next();
  } else {
    // If the user is not authenticated, redirect to the login page
    res.redirect('/login');
  }
}
  


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
  const loggedIn = req.session.loggedin
    res.render('contact', { loggedIn });
});

app.get("/privacy", (req,res) => {
  const loggedIn = req.session.loggedin
    res.render('privacy', { loggedIn });
});

app.get('/logged', isAuthenticated, function(req, res) {
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
  let loggedIn = req.session.loggedin;
    res.render('deals', loggedIn);
});

app.get("/lidl_vouchers", (req, res) => {
  let readsql = "SELECT id, text, company, saving, code, link, category, image FROM vouchers WHERE LOWER(company) = 'lidl'";
  connection.query(readsql, (err, rows) => {
    try {
      if (err) throw err;
      let voucherData = rows;
      let loggedIn = req.session.loggedin;
      res.render('lidl_vouchers', { title: 'Lidl Vouchers', voucherData, loggedIn });
    } catch (err) {
      console.error(err);
      res.status(500).send('Failed to load vouchers');
    }
  });
});

app.get("/pizza_hut_vouchers", (req, res) => {
  let readsql = "SELECT id, text, company, saving, code, link, category, image FROM vouchers WHERE LOWER(company) = 'pizza hut'";
  connection.query(readsql, (err, rows) => {
    try {
      if (err) throw err;
      let voucherData = rows;
      let loggedIn = req.session.loggedin;
      res.render('pizza_hut_vouchers', { title: 'Pizza Hut Vouchers', voucherData, loggedIn });
    } catch (err) {
      console.error(err);
      res.status(500).send('Failed to load vouchers');
    }
  });
});

app.get("/amazon_vouchers", (req, res) => {
  let readsql = "SELECT id, text, company, saving, code, link, category, image FROM vouchers WHERE LOWER(company) = 'amazon'";
  connection.query(readsql, (err, rows) => {
    try {
      if (err) throw err;
      let voucherData = rows;
      let loggedIn = req.session.loggedin;
      res.render('amazon_vouchers', { title: 'Amazon Vouchers', voucherData, loggedIn });
    } catch (err) {
      console.error(err);
      res.status(500).send('Failed to load vouchers');
    }
  });
});

app.get("/cineworld_vouchers", (req, res) => {
  let readsql = "SELECT id, text, company, saving, code, link, category, image FROM vouchers WHERE LOWER(company) = 'cineworld'";
  connection.query(readsql, (err, rows) => {
    try {
      if (err) throw err;
      let voucherData = rows;
      let loggedIn = req.session.loggedin;
      res.render('cineworld_vouchers', { title: 'Cineworld Vouchers', voucherData, loggedIn });
    } catch (err) {
      console.error(err);
      res.status(500).send('Failed to load vouchers');
    }
  });
});

app.get("/tesco_vouchers", (req, res) => {
  let readsql = "SELECT id, text, company, saving, code, link, category, image FROM vouchers WHERE LOWER(company) = 'tesco'";
  connection.query(readsql, (err, rows) => {
    try {
      if (err) throw err;
      let voucherData = rows;
      let loggedIn = req.session.loggedin;
      res.render('tesco_vouchers', { title: 'Tesco Vouchers', voucherData, loggedIn });
    } catch (err) {
      console.error(err);
      res.status(500).send('Failed to load vouchers');
    }
  });
});

app.get("/product", (req, res) => {
  let readsql = "SELECT id, text, city, info, saving, url, voucher, company, member_id, image, rrp, likes FROM deals";
  connection.query(readsql, (err, rows) => {
    try {
      if (err) throw err;
      let rowdata = rows;
      let loggedIn = req.session.loggedin || false;
      res.render('product', { title: 'Product', rowdata, loggedIn });
    } catch (err) {
      console.error(err);
      res.status(500).send('Failed to load deals');
    }
  });
});

app.post('/like_deal', (req, res) => {
  const dealId = req.body.dealId;
  
  db.query(
    'UPDATE deals SET likes = likes + 1 WHERE id = ?',
    [dealId],
    (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update like count' });
      } else {
        res.status(200).json({ message: 'Deal liked!' });
      }
    }
  );
});

app.get("/filteredDeals", (req, res) => {
  const cityFilter = req.query.city;
  const savingFilter = req.query.saving;
  const categoryFilter = req.query.category;

  // Construct the SQL query based on the filter criteria
  let sql = "SELECT * FROM deals WHERE 1 = 1";
  const params = [];

  if (cityFilter) {
    sql += " AND city = ?";
    params.push(cityFilter);
  }

  if (savingFilter) {
    sql += " AND saving = ?";
    params.push(savingFilter);
  }

  if (categoryFilter) {
    sql += " AND category = ?";
    params.push(categoryFilter);
  }

  // Execute the SQL query
  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error fetching deals from the database:", err);
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    res.json(results);
  });
});

app.get("/vouchers", (req, res) => {
  let readsql = "SELECT id, text, company, saving, code, link, category, image FROM vouchers";
  connection.query(readsql, (err, rows) => {
    try {
      if (err) throw err;
      let voucherData = rows;
      let loggedIn = req.session.loggedin;
      res.render('vouchers', { title: 'Vouchers', voucherData, loggedIn });
    } catch (err) {
      console.error(err);
      res.status(500).send('Failed to load vouchers');
    }
  });
});


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
            rrp: rows[0]['rrp'],
            likes: rows[0]['likes']
        };
        res.render('deals',{deals})
    });
});

app.get("/rows",(req,res) => {
  let showid = req.query.id;
  let readsql = "SELECT * FROM vouchers WHERE id = ?";
  connection.query(readsql,[showid],(err, rows)=>{
      if(err) throw err;
      let vouchers = {
          text: rows[0]['text'],
          company: rows[0]['company'],
          saving: rows[0]['saving'],
          link: rows[0]['link'],
          category: rows[0]['category'],
          image: rows[0]['image'],
      };
      res.render('vouchers',{vouchers})
  });
});

app.get("/entertainment-deals", (req,res) => {
  let showid = req.query.id;
  let readsql = "SELECT * FROM `deals` WHERE `category` = 'Entertainment';";
  connection.query(readsql,(err, rows)=>{
    if(err) throw err;
    let rowdata = rows;
    let loggedIn = req.session.loggedin;
    res.render('entertainment-deals',{title: 'Entertainment Deals', rowdata, loggedIn});
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
      let loggedIn = req.session.loggedin;
      res.render('daysout', { title: 'Days Out Deals', rowdata, loggedIn });
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
      let loggedIn = req.session.loggedin;
      res.render('groceries-deals', { title: 'Groceries Deals', rowdata, loggedIn });
    }
  });
});

app.get('/outdoor-deals', (req, res) => {
  let readsql = "SELECT * FROM `deals` WHERE `category` = 'Outdoor products';";
  connection.query(readsql, (err, rows) => {
    if (err) {
      console.error(err);
      res.send('An error occurred while fetching outdoor products deals.');
    } else {
      let rowdata = rows;
      let loggedIn = req.session.loggedin;
      res.render('outdoor-deals', { title: 'Outdoor Product Deals', rowdata, loggedIn });
    }
  });
});

app.get('/indoor-deals', (req, res) => {
  let readsql = "SELECT * FROM `deals` WHERE `category` = 'Indoor products';";
  connection.query(readsql, (err, rows) => {
    if (err) {
      console.error(err);
      res.send('An error occurred while fetching indoor products deals.');
    } else {
      let rowdata = rows;
      let loggedIn = req.session.loggedin;
      res.render('indoor-deals', { title: 'Indoor Product Deals', rowdata, loggedIn });
    }
  });
});

app.get('/eatingout-deals', (req, res) => {
  let readsql = "SELECT * FROM `deals` WHERE `category` = 'Eating out';";
  connection.query(readsql, (err, rows) => {
    if (err) {
      console.error(err);
      res.send('An error occurred while fetching eating out deals.');
    } else {
      let rowdata = rows;
      let loggedIn = req.session.loggedin;
      res.render('eatingout-deals', { title: 'Eating Out Deals', rowdata, loggedIn });
    }
  });
});

app.get("/post_deals", (req,res) => {
  // Check if the user is logged in and has a valid session
  if (!req.session.loggedin) {
    return res.redirect("/login");
  } else{
    res.render('post_deals');
  }
});

app.get("/post_vouchers", (req,res) => {
  // Check if the user is logged in and has a valid session
  if (!req.session.loggedin) {
    return res.redirect("/login");
  } else{
    res.render('post_vouchers');
  }
});

app.post('/submit-deal', (req, res) => {
  const { deal, city, info, saving, url, voucher, company, category, image, rrp } = req.body;
  
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

app.post('/submit-voucher', (req, res) => {
  const { voucher, company, saving, code, url, category, image } = req.body;
  
  // Insert voucher into the database
  db.query(
    `INSERT INTO vouchers (text, company, saving, code, link, category, image) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [voucher, company, saving, code, url, category, image],
    (err) => {
      if (err) {
        console.error(err);
        res.send('An error occurred during posting voucher.');
      } else {
        res.redirect('/post_vouchers');
      }
    }
  );
});

app.post('/save-deal', (req, res) => {
  // Save deal into the database
  const memberId = req.session.user_id;
  const dealId = req.query.id;
  console.log('Request Payload', req.query.id);
  db.query(
    `INSERT INTO saved_deals (memberid, dealid) VALUES (?, ?)`,
    [memberId, dealId],
    (err, result) => {
      if (err) {
        console.error(err);
        res.send('An error occurred during saving deal.');
      } else {
        console.log('Deal saved successfully');
        res.redirect('/product');
      }
    }
    );
});

// Get Saved Deals 
app.get('/get_saved_deals', isAuthenticated, (req, res) => {
  const memberId = req.session.user_id; 
  
  // Query to fetch saved deals associated with the logged-in user
  const sql = `
    SELECT deals.id, deals.text, deals.city, deals.info, deals.saving, deals.url, deals.voucher, deals.company, deals.member_id, deals.image, deals.rrp, deals.likes
    FROM deals
    INNER JOIN saved_deals ON deals.id = saved_deals.deal_id
    WHERE saved_deals.user_id = ?;
  `;
  
  db.query(sql, [memberId], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch saved deals.' });
    } else {
      const savedDeals = results;
      res.status(200).json(savedDeals);
    }
  });
});


app.get("/saved", (req, res) => {
  // Check if the user is logged in and has a valid session
  if (!req.session.loggedin) {
    return res.redirect("/login");
  }

  // Fetch the user's saved deals from the database
  const memberId = req.session.user_id;
  const sql = "SELECT * FROM saved_deals WHERE memberid = ?";
  
  db.query(sql, [memberId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Failed to fetch saved deals");
    }

    const savedDeals = rows;

    // Render the saved_deals.ejs template with the savedDeals data
    res.render("saved", { savedDeals });
  });
});

app.get('/save', (req, res) => {
  if (!req.session.loggedin) {
    return res.redirect("/login");
  } else {
    const dealId = req.query.id;
    const memberId = req.session.user_id;

    const query = 'INSERT INTO saved_deals (memberid, dealid) VALUES (?, ?)';
    db.query(query, [memberId, dealId], (err, result) => {
      if (err) {
        console.error('Error saving deal:', err);
        res.send('<code>Failed to save deal</code> <a href="/product" class="button">BACK</a>');
      } else {
        res.redirect('/product');
      }
    });
  }
});

app.post('/like-deal', isAuthenticated, (req, res) => {
  const memberId = req.session.user_id;
  const dealId = req.body.dealId;

  console.log(dealId);

  // Check if the user has already liked the deal
  const sqlCheckLiked = "SELECT COUNT(*) AS count FROM deals WHERE id = ? AND member_id = ?";
  db.query(sqlCheckLiked, [dealId, memberId], (err, result) => {
      if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to check if liked.' });
      }

      const isLiked = result[0].count > 0;

      if (isLiked) {
          // User has already liked the deal, so remove the like
          const sqlRemoveLike = "UPDATE deals SET likes = likes - 1 WHERE id = ? AND member_id = ?";
          db.query(sqlRemoveLike, [dealId, memberId], (err, result) => {
              if (err) {
                  console.error(err);
                  return res.status(500).json({ error: 'Failed to remove like.' });
              }

              // Get the updated likes count for the deal
              const sqlGetLikesCount = "SELECT likes FROM deals WHERE id = ?";
              db.query(sqlGetLikesCount, [dealId], (err, result) => {
                  if (err) {
                      console.error(err);
                      return res.status(500).json({ error: 'Failed to get likes count.' });
                  }

                  const likesCount = result[0].likes;
                  res.json({ likes: likesCount, isLiked: false }); // Return the updated likes count and indicate it is unliked
              });
          });
      } else {
          // User has not liked the deal, so add a like
          const sqlAddLike = "UPDATE deals SET likes = likes + 1 WHERE id = ? AND member_id = ?";
          db.query(sqlAddLike, [dealId, memberId], (err, result) => {
              if (err) {
                  console.error(err);
                  return res.status(500).json({ error: 'Failed to add like.' });
              }

              // Get the updated likes count for the deal
              const sqlGetLikesCount = "SELECT likes FROM deals WHERE id = ?";
              db.query(sqlGetLikesCount, [dealId], (err, result) => {
                  if (err) {
                      console.error(err);
                      return res.status(500).json({ error: 'Failed to get likes count.' });
                  }

                  const likesCount = result[0].likes;
                  res.json({ likes: likesCount, isLiked: true }); // Return the updated likes count and indicate it is liked
              });
          });
      }
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
                req.session.user_id = rows[0].id;
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
    res.redirect('/');
  });
  
  
//server
app.listen(process.env.PORT || 3000);
console.log(" Server is listening on //localhost:3000/ ");