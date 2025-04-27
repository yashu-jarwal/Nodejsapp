const https = require('http')
const express = require('express')
const bodyParser = require("body-parser")
const cors = require('cors');
// const {sendOTP, verifyOTP} = require('./otp');
var app = express()
var mysql = require('mysql')
const axios = require('axios');
const otpStore = {}; // Temporary storage
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

// start opt

const sendOTP = async (mobileNumber, otp) => {
    const url = 'https://www.fast2sms.com/dev/bulkV2';
    
    const data = {
      variables_values: otp,
      route: 'otp',
      numbers: mobileNumber
    };
  
    try {
      const response = await axios.post(url, data, {
        headers: {
          'authorization': 'G4onSBecXAyOFbm8qr1Mgk2UVJi05zuZlWC96I3NPEfYjKadRwa7uY6h8qDTbON19lJKXpQSELkew2zV',
          'Content-Type': 'application/json'
        }
      });
      console.log('OTP Sent:', response.data);
    } catch (error) {
      console.error('Error sending OTP:', error.response.data);
    }
  };
  
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };
  app.post('/send-otp', async (req, res) => {
    const { mobileNumber } = req.body;
    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    
    otpStore[mobileNumber] = { otp, expiresAt };
    
    await sendOTP(mobileNumber, otp);
    
    res.send({ message: 'OTP sent.' });
  });
  
  app.post('/verify-otp', (req, res) => {
    const { mobileNumber, otp } = req.body;
    const record = otpStore[mobileNumber];
  
    if (!record) {
      return res.send({ success: false, message: 'OTP not found. Request again.' });
    }
  
    if (Date.now() > record.expiresAt) {
      delete otpStore[mobileNumber];
      return res.send({ success: false, message: 'OTP expired. Request again.' });
    }
  
    if (record.otp !== otp) {
      return res.send({ success: false, message: 'Invalid OTP.' });
    }
  
    delete otpStore[mobileNumber];
    res.send({ success: true, message: 'OTP verified successfully!' });
  }); 

//end otp


// API to send OTP
// app.post('/send-otp', async (req, res) => {
//     const { mobileNumber } = req.body;
//     if (!mobileNumber) {
//       return res.status(400).json({ message: 'Mobile number is required' });
//     }
    
//     try {
//       await sendOTP(mobileNumber);
//       res.status(200).json({ message: 'OTP sent successfully!' });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Failed to send OTP' });
//     }
//   });
  
//   // API to verify OTP
//   app.post('/verify-otp', (req, res) => {
//     const { mobileNumber, otp } = req.body;
//     if (!mobileNumber || !otp) {
//       return res.status(400).json({ message: 'Mobile number and OTP are required' });
//     }
    
//     const isValid = verifyOTP(mobileNumber, otp);
    
//     if (isValid) {
//       res.status(200).json({ message: 'OTP verified successfully ✅' });
//     } else {
//       res.status(400).json({ message: 'Invalid OTP ❌' });
//     }
//   });

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

// Define route for fetching data from SQL Server
app.get("/gstcpin", verifyToken, (request, response) => {
    // Execute a SELECT query
    console.log("data fatch");
    config.query("SELECT * FROM gst_cpin", (err, result) => {
        if (err) {
            console.error("Error executing query:", err);
        } else {
            console.error("response executing query:");
            response.send(result); // Send query result as response
            // console.dir(result);
        }
    });
});


// Define route for fetching data from SQL Server
app.get("/getGstCpinByPayMode", verifyToken, (request, response) => {
    const payMode = request.query.payMode
    // Execute a SELECT query
    config.query('SELECT * FROM gst_cpin where PayMode=?', [payMode], (err, result) => {
        // config.query("SELECT * FROM gst_cpin where PayMode='OTC'", (err, result) => {

        if (err) {
            console.error("Error executing query:", err);
        } else {
            console.error("response executing query:");
            response.send(result); // Send query result as response
            // console.dir(result);
        }
    });
});


// get method fatch userinfo by userid from user_infor table
app.get('/GetUserInfo/:id',verifyToken, (req, res) => {
    // Extract the 'id' parameter from the request path
    console.log("reqbody__",req.params);
    
    const userId = req.params.id;

    config.query('SELECT * FROM userinfo WHERE UserID = ?', [userId], (err, result) => {
        if (err) {
            // Log the error and send a 500 status with an error message
            console.error("Error executing query:", err);
            return res.status(500).json({ message: "Internal Server Error", error: err });
        } else {
            // If the query is successful, send the result as a JSON response
            console.log("Query result:", result);
            if (result.length > 0) {
                // If user found, return the result
                return res.status(200).json(result);
            } else {
                // If no user found, return a 404 error
                return res.status(404).json({ message: "User not found" });
            }
        }
    });
})

// post method update userinfo email using user_info table from yashu_node data base
app.post('/Updateinfo', verifyToken, (req, res) => {
    const { newEmail, UserID } = req.body;
    console.log("testin__", req.body);

    // SQL query to update the user's email and age
    const updateQuery = 'UPDATE userinfo SET Email_ID = ? WHERE UserID = ?';

    // Execute the query
    config.query(updateQuery, [newEmail, UserID], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Server error' })
        }
        console.log("update_info_res",results)
        // If the query returns a result, the email and password match
        // res.status(200).json({ message: 'Login successful' });
        // Send the token back to the client
        res.status(200).json({
            message: 'Updateion successful',
        });
    })

});


// post method login verify using user_info table from yashu_node data base

app.post('/login', (req, res) => {
    const { UserID, Password } = req.body;

    console.log(UserID, Password);
    // Generate the JWT token
    const token = jwt.sign({ userId: UserID }, secretKey, { expiresIn: '5h' });

    config.query('SELECT * FROM userinfo WHERE UserID=? AND Password=?', [UserID, Password], (err, result) => {
        console.log("result__", err, result)
        if (err) {
            return res.status(500).json({ message: 'Server error' })
        }
        if (result.length === 0) {
            return res.status(400).json({ message: 'UserID or Password is incorrect' });
        }
        // If the query returns a result, the email and password match
        // res.status(200).json({ message: 'Login successful' });
        // Send the token back to the client
        res.status(200).json({
            message: 'Login successful',
            token: token
        });
    })

});

app.post('/Register', (req, res) => {
    const { UserID, Name, UserName, Password, EmpId } = req.body;

    config.query('SELECT * FROM userinfo WHERE UserID=?', [UserID], (err, result) => {
        console.log("result__", err, result)
        if (err) {
            return res.status(500).json({ message: 'Server error' })
        }
        // If the username already exists
        if (result.length > 0) {
            return res.status(400).json({ message: 'Username already taken' });
        }
        const query = 'INSERT INTO userinfo (UserID,Name, UserName,Password,EmpId) VALUES (?, ?,?,?,?)';
        config.query(query, [UserID, Name, UserName, Password, EmpId], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error inserting user into database', error: err });
            }

            return res.status(200).json({ message: 'User registered successfully' });
        });

        // Insert the new user into the database

    })


})



// // Define route for insert data to Treasruy Table SQL Server
// app.post('/employee/insert/mapping', function (req, res) {
//     console.log("requ___", req.body);
//     const TreasruyName = req.body.TreasruyName;
//     const TreasuryCode = req.body.TreasuryCode;

//     config.query("INSERT INTO treasruy(TreasruyName, TreasuryCode) VALUES ('" + TreasruyName + "','" + TreasuryCode + "')", (err, result) => {

//         if (err) {
//             console.log("error___", err);
//             res.send(err)
//         }
//         else {
//             console.log("connect_insert");
//             res.send("posted")
//         }
//     })
// })

// // Define route for update data to Treasruy Table SQL Server
// app.put('/employee/update/mapping', function (req, res) {
//     console.log("requ___", req.body);
//     const SubTreasury_code = req.body.SubTreasury_code;
//     const TreasuryCode = req.body.TreasuryCode;
//     config.query('UPDATE treasruy SET ? WHERE TreasuryCode =' + TreasuryCode,
//         { SubTreasury_code: SubTreasury_code, }, (err, result) => {

//             if (err) {
//                 console.log("error___", err);
//                 res.send(err)
//             }
//             else {
//                 console.log("connect_insert");
//                 res.send({
//                     "status": true,
//                     "message": "Data Successfully updated"
//                 })
//             }
//         })
// })

// // Define route for delete data to Treasruy Table SQL Server
// app.delete('/employee/Delete', function (req, res) {
//     console.log("requ___", req.body);
//     const TreasuryCode = req.body.TreasuryCode;
//     config.query('DELETE FROM treasruy WHERE TreasuryCode =' + TreasuryCode,
//         (err, result) => {
//             if (err) {
//                 console.log("error___", err);
//                 res.send(err)
//             }
//             else {
//                 console.log("connect_insert");
//                 res.send({
//                     "status": true,
//                     "message": "Data Successfully Delete"
//                 })
//             }
//         })
// })

// // fatch specific treasury data treasury table 
// app.get('/employee_list/:Treasury', function (req, res) {

//     let TreasuryFilter = req.params.Treasury
//     console.log("sdsdsf", TreasuryFilter);

//     config.query("SELECT * FROM treasruy WHERE SubTreasury_code=" + TreasuryFilter, (err, result) => {
//         if (err) {
//             console.log("err_");
//             res.send(err)
//         }
//         else {
//             console.log("res__", result);
//             res.send({
//                 "Status": true,
//                 "result": result
//             })
//         }
//     })
// })


// //user login creditials check
// app.post('/user/login', function (req, res) {
//     console.log("requ___", req.body);
//     const UserName = req.body.UserName;
//     const Password = req.body.Password;

//     config.query("SELECT * FROM gst_cpin WHERE UserName=? AND Password=?", [UserName, Password], function (err, result) {

//         if (err) {
//             console.log("error___", err);
//             res.send(err)
//         }
//         else {
//             console.log("Login successfully", result);
//             if (result.length > 0) {
//                 res.send({
//                     'Status': true,
//                     'Message': 'Successfully Login!'
//                 })
//             }
//             else {
//                 res.send({
//                     'Status': false,
//                     'Message': 'Login Failed. Please Check User Name or Password'
//                 })
//             }

//         }
//     })
// })





// Start the server on port 3000
app.listen(5000, () => {
    console.log("Listening on port 5000...");
});
