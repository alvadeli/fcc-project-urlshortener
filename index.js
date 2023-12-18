require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require("body-parser");
const dns = require("dns");
const url = require('url');
const { Console } = require('console');
const { hostname } = require('os');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

let urlPairs = []

//Middleware functions
const urlSaver = (req,res,next) => {
  if (req.method === "POST"){
    urlPairs.push({orginal_url: req.body.url, short_url:urlPairs.length});
  }  
  next();
}

//Mount middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(urlSaver)
app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.get('/api/shorturl/:value', function(req, res) {
  let shorturl = parseInt(req.params.value);
  let urlPair = urlPairs.find(obj => obj.short_url === shorturl);

  if (urlPair){
    res.redirect(urlPair.orginal_url);
  } else {
    res.json({error:	"No short URL found for the given input"})
  }
});

app.post('/api/shorturl', (req,res) => {

  let {hostname} = url.parse(req.body.url);

  if (!hostname) {
    res.json({ error: 'invalid url' });
    urlPairs.pop();
    return;
  }

  dns.lookup(hostname, (err, address, family) => {
    if (err) {
      console.error(`Error looking up ${hostname}: ${err.message}`);
      res.json({ error: 'invalid url' });
      urlPairs.pop();
      return;
    } 
    console.log(`IP address of ${hostname}: ${address}, IP version: IPv${family}`);
    res.json({original_url: urlPairs[urlPairs.length-1].original_url, short_url:urlPairs[urlPairs.length-1].short_url})
  });
});

var listener = app.listen(port, function() {
  console.log(`Listening on port ${port}`);
  //console.log(`Server is running at http://localhost:${listener.address().port}`);
});
