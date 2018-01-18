<<<<<<< HEAD
function loadLoginForm() {

    var loginHtml = `

        <h3>Login/Register to unlock awesome features</h3>

        <input type="text" id="username" placeholder="username" />

        <input type="password" id="password" />

        <br/><br/>

        <input type="submit" id="login_btn" value="Login" />

        <input type="submit" id="register_btn" value="Register" />

        `;

    document.getElementById('login_area').innerHTML = loginHtml;

    

    // Submit username/password to login

    var submit = document.getElementById('login_btn');

    submit.onclick = function () {

        // Create a request object

        var request = new XMLHttpRequest();

        

        // Capture the response and store it in a variable

        request.onreadystatechange = function () {

          if (request.readyState === XMLHttpRequest.DONE) {

              // Take some action

              if (request.status === 200) {

                  submit.value = 'Sucess!';

              } else if (request.status === 403) {

                  submit.value = 'Invalid credentials. Try again?';

              } else if (request.status === 500) {

                  alert('Something went wrong on the server');

                  submit.value = 'Login';

              } else {

                  alert('Something went wrong on the server');

                  submit.value = 'Login';

              }

              loadLogin();

          }  

          // Not done yet

        };

        

        // Make the request

        var username = document.getElementById('username').value;

        var password = document.getElementById('password').value;

        console.log(username);

        console.log(password);

        request.open('POST', '/login', true);

        request.setRequestHeader('Content-Type', 'application/json');

        request.send(JSON.stringify({username: username, password: password}));  

        submit.value = 'Logging in...';

        

    };

    

    var register = document.getElementById('register_btn');

    register.onclick = function () {

        // Create a request object

        var request = new XMLHttpRequest();

        

        // Capture the response and store it in a variable

        request.onreadystatechange = function () {

          if (request.readyState === XMLHttpRequest.DONE) {

              // Take some action

              if (request.status === 200) {

                  alert('User created successfully');

                  register.value = 'Registered!';

              } else {

                  alert('Could not register the user');

                  register.value = 'Register';

              }

          }

        };

        
//var st={username: "username", password: "password"};
        // Make the request

        var username = document.getElementById('username').value;

        var password = document.getElementById('password').value;

        console.log(username);

        console.log(password);

        request.open('POST', '/create-user', true);

        request.setRequestHeader('Content-Type', 'application/json');

        request.send(JSON.stringify({username:username, password:password}));  
        register.value = 'Registering...';

    

    };

}



function loadLoggedInUser(username) {

    var loginArea = document.getElementById('login_area');

    loginArea.innerHTML = `

        <h3> Hi <i>${username}</i></h3>

        <a href="/logout">Logout</a>

    `;

}



function loadLogin() {

    // Check if the user is already logged in

    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {

        if (request.readyState === XMLHttpRequest.DONE) {

            if (request.status === 200) {

                loadLoggedInUser(this.responseText);

            } else {

                loadLoginForm();

            }

        }

    };

    

    request.open('GET', '/check-login', true);

    request.send(null);

}



function loadArticles() {

        // Check if the user is already logged in

    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {

        if (request.readyState === XMLHttpRequest.DONE) {

            var articles = document.getElementById('articles');

            if (request.status === 200) {

                var content = '<ul>';

                var articleData =JSON.parse(this.responseText);

                for (var i=0; i< articleData.length; i++) {

                    content += `<li>

                   <a href="/articles/${articleData[i].title}">${articleData[i].heading}</a>

                    (${articleData[i].date})</li>`;

                }

                content += '</ul>'

                articles.innerHTML = content;

            } else {

                articles.innerHTML('Oops! Could not load all articles!');

            }

        }

    };

    

    request.open('GET', '/get-articles', true);

    request.send(null);

}





// The first thing to do is to check if the user is logged in!

loadLogin();



// Now this is something that we could have directly done on the server-side using templating too!

loadArticles();
=======
//submit username/password to login

var submit = document.getElementById('submit_btn');
submit.onclick = function () {
    
    //Create a request object
  var request= new XMLHttpRequest();
  
  //Capture the response and store it in a variable
  request.onreadystatechange = function (){
     if(request.readyState === XMLHttpRequest.DONE){
         //Take some action
         if(request.status === 200){
            //Capture list of names and render it as a list.
            console.log('user logged in');
             alert('logged in successfully');
              }
              else if(request.status === 403){
               alert('username/password is inorrect');   
              }
              else if(request.status === 500){
               alert('Something went wrong on the server');   
              }
     }
    //Not done yet
         
  };
  
  //Make the request
  var username = document.getElementById('username').value;
  var password = document.getElementById('password').value;
  console.log(username);
  console.log(password);
  
  request.open('POST','http://raziyasultana1997.imad.hasura-app.io/login',true);
  request.setRequestHeader('Content-Type','application/json');
   request.send(JSON.stringify({username: username, password: password}));
 
 
    //make a request to the server and send the name
};












>>>>>>> 158209ce347d67a256fc6f0d0ef00d8276edd2b4
