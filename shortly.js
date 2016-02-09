var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();
app.set('loggedIn', false);

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.get('/',
function(req, res) {
  var loggedIn = app.get('loggedIn');
  if( loggedIn ) {
    res.render('index');
  } else {
    res.redirect('/login')
  }
});

app.get('/create',
function(req, res) {
  var loggedIn = app.get('loggedIn');
  if( loggedIn ) {
    res.render('index');
  } else {
    res.redirect('/login')
  }
});

app.get('/signup',
function(req, res) {
  res.render('signup');
});

app.get('/login',
function(req, res) {
  res.render('login');
});

app.get('/links',
function(req, res) {
  var loggedIn = app.get('loggedIn');
  if( loggedIn ) {
    Links.reset().fetch().then(function(links) {
      res.send(200, links.models);
    });
  } else {
    res.redirect('/login')
  }
});

app.post('/links',
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        Links.create({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        })
        .then(function(newLink) {
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/
app.post('/signup',
function(req, res){

  new User(req.body).fetch().then(function(found){
    if (found) {
      // Print out to screen that user exits
      console.log('user has already existed');
    } else {
      Users.create({
        username: req.body.username,
        password: req.body.password
      })
      .then(function() {
        console.log('user created');
        // create a logged in state
        res.redirect('/');
      });
    }
  });

});

app.post('/login',
function(res, req){
  new User(req.body).fetch().then(function(found){
    if (found) {
      //console.log('found ', found);
      app.set('loggedIn', true);
      console.log('loggedIn ', util.checkUser());
      // create a logged in state
      // res.redirect('/');
      //console.log('req.params ', req);
    } else {
      console.log('404');
    }
  });
});

/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        linkId: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
