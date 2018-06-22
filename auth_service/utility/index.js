let mongoose = require('mongoose');
var ObjectId = require('mongoose').Types.ObjectId;
let bcrypt   = require('bcrypt');
let request  = require('request');

exports.getIp = function (req) {
    return req.headers['x-forwarded-for'] || req.connection.remoteAddress
           || req.socket.remoteAddress ;
}

exports.checkmongoId = function(req_id){
    //return checkForHexRegExp = new RegExp("^[0-9a-fA-F]{24}$").test(req_id);
    return ObjectId.isValid(req_id)
}

exports.get_mongoose_id = function(array_data){
    console.log("mongoose.Types.ObjectId.isValid", mongoose.Types.ObjectId.isValid(array_data[0]));
    console.log("array_data", array_data);
    return  array_data.map(item  => new mongoose.Types.ObjectId(item));
} 

exports.random_string = (x) => {
    var s = "";
    while(s.length<x&&x>0){
        var r = Math.random();
        s+= String.fromCharCode(Math.floor(r*26) + (r>0.5?97:65));
    }
    return s;
}

exports.getToken = (req)=>{
    return req.query.token || req.headers['x-access-token'] || req.body.token || req.params.token ;
}

exports.cryptPassword = (password) => {
    return new Promise((resolve, reject)=>{
        bcrypt.genSalt(10, function(err, salt) {
            if (err) {
                return reject(err);
            } 
            bcrypt.hash(password, salt, function(err, hash) {
                if(err){
                    return reject(err);
                } else {
                    return resolve(hash);
                }
            });
        });
    })
};

exports.http_req = (token, method, url, req_data)=>{
    return new Promise ((resolve, reject)=>{
        var options = { 
            method: method, url: url,
            headers: { 
                'cache-control': 'no-cache',
                'x-access-token': token,
                'content-type': 'application/json' 
            }, body: req_data
        };

        console.log("\n HTTP req options = ", options);
        request(options, function (err, response, body) {
            if (err) {
                if((err.connect === true) || (err.code === 'ETIMEDOUT')){
                    reject({"status":"false", "err":"Internal Server Error", "msg": "Remote Service request timeout error"});
                } else {
                    reject({"status":"false", "err":"Internal Server Error"});
                }
            } else if(response.statusCode == 500 || response.statusCode == 502){
                reject({"err":"Internal Server Error"});
            } else {
                let res_data = [];
                if(response.body){
                    res_data = JSON.parse(response.body);
                }
                resolve(res_data);
            }    
        });
    })

}