let path = require('path');
let fs = require('fs');
let multer = require('multer');
let upload = multer({ dest: '/tmp/' });

let auth = require('./src/authentication');

let user_val = require('./middlewares/validators/user');

var init_modules = function (app) {
    // auth.init(app);
};

exports = module.exports = function (app) {
    init_modules(app);

    app.get('/', function (req, res) {
        res.status(200).json({ "Status": "Welcome to Node App" });
    });

    

    //route not found
    app.all('*', function (req, res) {
        app.logger.log("PATH NOT FOUND");
        app.logger.log(3, null, " PATH NOT FOUND", __filename, app.utility.getIp(req), req.originalUrl);
        res.status(404).json({ "err": "Path Not Found" });
    });
};

