'user strict';

exports = module.exports = function(app, mongoose) {
    var UserSchema = new mongoose.Schema({
        "name"                  : { type : String },
        "empid"                 : { type : String },
        "email"                 : { type : String },
        "businessunit"          : { type : String },
        "department"            : { type : String },
        "designation"           : { type : String }, 
        "role"                  : { type : String },
        "password"              : { type : String },
        "status"                : { type : String, "default":"A" },
        "lastloggedin"          : { type : String } 
    }, {
        timestamps: true
    });
    app.db.model('User', UserSchema);
};