const http = require('http');
// _extarnal_url = 'http://172.22.32.117:9099/rajkosh/3.0/mst/getdepartment/2100';
_extarnal_url = 'http://172.22.32.105:9099/rajkosh/3.0/mst/all/treasuryList'
let JwtToken_loc = 'eyJhbGciOiJIUzUxMiJ9.eyJ0Q29kZSI6IjIxMDAiLCJleHAiOjE3MTMyNTQzMjIsInVzZXJJZCI6NTk4NjQsImFJZCI6OTY5OTQsImlhdCI6MTcxMzI0NTMyMiwic3RhdHVzIjoxfQ.oOXKhZoi3zraoy2AfEJuWDuzGX6rR5zNkfiS57f6S7T_Jq_BMiO5aN-xwQLI1QvMc_PzgCBZMy5AuH51Z6R-ZA'

var options = {
    'method': 'GET',
    'url': _extarnal_url,
    'headers': {
        'Authorization': 'Bearer ' + JwtToken_loc,
        'Content-Type': 'application/json'
    }
};

const callexternalapiusingHttp = (callback) => {
    http.get(options, (resp) => {
        let data = '';


        // a chunk of data has been received
        resp.on('data', (chunk) => {
            data += chunk;
        })

        //
        resp.on('end', () => {
            console.log("testeswp_",JSON.stringify(data));
            return callback(data)
        });

    }).on('error', (err) => {
        console.log('Error:' + err.message);
    })
}

module.exports.callApi = callexternalapiusingHttp;
