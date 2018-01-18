var express = require('express');
var morgan = require('morgan');
var path = require('path');
var mysql = require('mysql');
var crypto = require('crypto');
var bodyParser = require('body-parser');
var JSON = require('json-strictify');

var session = require('express-session');
 var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
 database:"mydatabase"     
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());

app.use(session({

    secret: 'someRandomSecretValue',

    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30}

}));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});


function createTemplate (data) {

    var title = data.title;

    var date = data.date;

    var heading = data.heading;

    var content = data.content;

    

    var htmlTemplate = `

    <html>

      <head>

          <title>

              ${title}

          </title>

          <meta name="viewport" content="width=device-width, initial-scale=1" />

          <link href="/ui/style.css" rel="stylesheet" />

      </head> 

      <body>

          <div class="container">

              <div>

                  <a href="/">Home</a>

              </div>

              <hr/>

              <h3>

                  ${heading}

              </h3>

              <div>

                  ${date.toDateString()}

              </div>

              <div>

                ${content}

              </div>

              <hr/>

              <h4>Comments</h4>

              <div id="comment_form">

              </div>

              <div id="comments">

                <center>Loading comments...</center>

              </div>

          </div>

          <script type="text/javascript" src="/ui/article.js"></script>

      </body>

    </html>

    `;

    return htmlTemplate;

}



app.get('/test-db', function (req, res) {
     //if (err) throw err;
    con.connect(function(err) {
    con.query("SELECT * FROM article",function(err,result,fields){
      if (err) throw err;
     console.log(result);
      res.send(result);
  });
});
});
var counter=0;
app.get('/counter', function (req, res) {
    counter=counter+1;
  res.send(counter.toString());
});

var names =[];
app.get('/submit-name', function(req, res){  //URL:/submit-name?name=xxxx
    //Get the name from the request
    var name = req.query.name;
    
    names.push(name);
    // JSON JavaScript Object Notation
    res.send(JSON.stringify(names));
});


function hash (input, salt) {

    // How do we create a hash?

    var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');

      return ["pbkdf2", "10000",salt, hashed];

    //  return ["pbkdf2", "10000",salt, hashed.toString('hex')].join('$');

}





app.get('/hash/:input', function(req, res) {

   var hashedString = hash(req.params.input, 'this-is-some-random-string');

   res.send(hashedString);

});



app.post('/create-user', function (req, res) {

   // username, password

   // {"username": "tanmai", "password": "password"}

   // JSON

   var username = req.body.username;

   var password = req.body.password;

   var salt = crypto.randomBytes(128).toString('hex');

   var dbString = hash(password, salt);

   con.query("INSERT INTO user(username, password) VALUES('"+req.body.username+"','"+req.body.password+"')", [username, dbString], function (err, result,fields) {

      if (err) {

          res.status(500).send(err.toString());

      } else {

          res.send('User successfully created: ' + username);

      }

   });

});



app.post('/login', function (req, res) {

   var username = req.body.username;

   var password = req.body.password;
   con.query('SELECT * FROM  `user`  WHERE `username` =?',[username],function (err,rows,field) {

      if (err) {

          res.status(500).send(err.toString());

      } else {

          if (rows.length === 0) {

              res.status(403).send(err.toString()); //username/password invalid

          } else {

              // Match the password

              var dbString = rows[0].password;

              var salt = dbString.split('$')[2];

             // var hashedPassword = hash(password,dbString); // Creating a hash based on the password submitted and the original salt

              if (password === dbString) {

                

                // Set the session

                req.session.auth = {userId: rows[0].id};

                // set cookie with a session id

                // internally, on the server side, it maps the session id to an object

                // { auth: {userId }}

                

                res.send('credentials correct!');

                

              } else {

                res.status(403).send('username/password is invalid');

              }

          }

      }

   });

});



app.get('/check-login', function (req, res) {

   if (req.session && req.session.auth && req.session.auth.userId) {

       // Load the user object

      con.query('SELECT * FROM `user` WHERE id = ?', [req.session.auth.userId], function (err, result,fields) {

           if (err) {

              res.status(500).send(err.toString());

           } else {

              res.send(result[0].username);    

           }

       });

   } else {

       res.status(400).send('You are not logged in');

   }

});



app.get('/logout', function (req, res) {

   delete req.session.auth;

   res.send('<html><body>Logged out!<br/><br/><a href="/">Back to home</a></body></html>');

});



//var pool = new Pool(config);



app.get('/get-articles', function (req, res) {

   // make a select request

   // return a response with the results

   con.query("SELECT * FROM article ORDER BY date DESC", function (err, result,fields) {

      if (err) {

          res.status(500).send(err.toString());

      } else {

          res.send(result);

      }

   });

});



app.get('/get-comments/:articleName', function (req, res) {

   // make a select request

   // return a response with the results

   con.query("SELECT a.title,c.comment, u.username ,c.timestamp FROM article a,comment c, user u WHERE a.id = c.article_id AND c.user_id = u.id ORDER BY c.timestamp DESC", [req.params.articleName], function (err, result,fields) {

      if (err) {

          res.status(500).send(err.toString());

      } else {

          res.send(result);

      }

   });

});



app.post('/submit-comment/:articleName', function (req, res) {

   // Check if the user is logged in

    if (req.session && req.session.auth && req.session.auth.userId) {

        // First check if the article exists and get the article-id

       con.query('SELECT * from `article` where title = ?', [req.params.articleName], function (err, result,fields) {

                    //var articleId = result[0].id;
            if (err) {

                res.status(500).send(err.toString());

            } else {

                if (result.length === 0) {

                    res.status(400).send('Article not found');

                } else {
                        
                   
                   var articleId =result[0].id;
                   
                    // Now insert the right comment for this article

                    con.query( "INSERT INTO comment (comment, article_id,user_id) VALUES (?,?,?)",[req.body.comment, articleId, req.session.auth.userId],

                    
                        function (err, rows,fields) {

                            if (err) {
                            
                                res.status(500).send(err.toString());

                            } else {

                                res.status(200).send('Comment inserted!')

                            }

                        });

                }

            }

       });     

    } else {

        res.status(403).send('Only logged in users can comment');

    }

});



app.get('/articles/:articleName', function (req, res) {

  // SELECT * FROM article WHERE title = '\'; DELETE WHERE a = \'asdf'

con.query("SELECT * FROM article WHERE title = ?", [req.params.articleName], function (err, result,fields) {

    if (err) {

        res.status(500).send(err.toString());

    } else {

        if (result.length === 0) {

            res.status(404).send('Article not found');

        } else {

            var articleData = result[0];

            res.send(createTemplate(articleData));

        }

    }

  });

});



app.get('/ui/:fileName', function (req, res) {

  res.sendFile(path.join(__dirname, 'ui', req.params.fileName));

});





var port = 8000; // Use 8080 for local development because you might already have apache running on 80

app.listen(8000, function () {

  console.log(`IMAD course app listening on port ${port}!`);

});