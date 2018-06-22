let _ = require('underscore');
let app;
let path = require('path');
let init = (application) => {
    app = application;
}
let bcrypt = require('bcrypt');