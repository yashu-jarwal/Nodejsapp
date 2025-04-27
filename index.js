const apiCallFromRequest = require('./Request')
const apiCallFromNode = require('./NodejsCall')
const https = require('http')
const express = require('express')
const bodyParser = require("body-parser")
const cors = require('cors');
var app = express()
var mysql = require('mysql')

app.use(cors())
// app.use(
//     bodyParser.urlencoded({
//         extended: true
//     })
// );
app.use(bodyParser.json());

//var sql = require("mssql");

// SQL Server configuration
var config = mysql.createConnection({
    user: "root", // Database username
    password: "MyNewPass", // Database password
    // server: "172.22.32.112", // Server IP address
    host: 'localhost',
    database: "gst", // Database name
    options: {
        "encrypt": false // Disable encryption
    }
})

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    let token;
  
    // Look for the token in the Authorization header (Bearer token)
    if (req.headers['authorization']) {
      token = req.headers['authorization'].split(' ')[1]; // Extract token from "Bearer YOUR_TOKEN"
    }
    // Or look for the token in the URL parameters (less secure)
    else if (req.query.token) {
      token = req.query.token;
    }
  
    if (!token) {
      return res.status(401).send('Access Denied: No Token Provided');
    }
  
    // Verify the token using jwt.verify
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(400).send('Invalid Token');
      }
      // Attach decoded info to the request object for future use
      req.user = decoded;
      next();
    });
  };
  
// Connect to SQL Server
config.connect(config, err => {
    if (err) {
        throw err;
    }
    console.log("Connection Successful!");
});

// Import the jsonwebtoken library
const jwt = require('jsonwebtoken');
// Define your secret key (this should be kept safe and secure)
const secretKey = 'test123';


const postmethod = (url,body)=> {
  return  app.get(url,verifyToken,(req,res)=> {
        config.query(body,(err,result)=> {
            if (err) {
                console.error("Error executing query:", err);
            } else {
                console.error("response executing query:");
                response.send(result); // Send query result as response
                // console.dir(result);
            }
        })
    })
}

// app.listen(5000, () => {
//     console.log("Listening on port 5000...");
// });

module.exports = { postmethod };


