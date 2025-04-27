const request = require('request');
const baseurl = 'http://172.22.32.105:9099/rajkosh/3.0/'

let JwtToken_loc = 'eyJhbGciOiJIUzUxMiJ9.eyJ0Q29kZSI6IjIxMDAiLCJleHAiOjE3MTMyNjg2NDAsInVzZXJJZCI6NTk4NjQsImFJZCI6OTY5OTQsImlhdCI6MTcxMzI1OTY0MCwic3RhdHVzIjoxfQ.g1Mcg-Am3KtwF2B02mwwEwFdOgj39qYDNQIP0mF3YMSWnKbEN8OqTtfd6DiXq9Wk0DobXwzvqNWlSlFZylsXOg'

const getTreasury_List = (callback) => {
    request({
        'method': 'GET',
        'url': baseurl + 'mst/all/treasuryList',
        'headers': {
            'Authorization': 'Bearer ' + JwtToken_loc,
            'Content-Type': 'application/json'
        }
    }, (err, res, body) => {
        if (err) {
            return callback(err)
        }
        return callback(body)
    })
}

const getDepartment_list = (ress, callback) => {
    console.log("call__back", ress, callback);
    request({
        'method': 'GET',
        'url': baseurl + 'mst/getdepartment/' + ress,
        'headers': {
            'Authorization': 'Bearer ' + JwtToken_loc,
            'Content-Type': 'application/json'
        }
    }, (err, res, body) => {
        if (err) {
            return callback(err)
        }
        return callback(body)
    })
}

const postmethod = (body_, callback) => {
    console.log("body___",body_);
    request({
        'method': 'POST',
        'url': baseurl + 'token/paymanager/tokenList',
        'headers': {
            'Authorization': 'Bearer ' + JwtToken_loc,
            'Content-Type': 'application/json'
        },
        'body':body_
    },
        (err, res, body) => {
            if (err) {
                return callback(err)
            }
            return callback(body)
        }
    )
}


module.exports.Fetch_Treasury = getTreasury_List;
module.exports.Fetch_Department = getDepartment_list;
module.exports.postApi= postmethod;