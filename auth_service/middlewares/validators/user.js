let _ = require('underscore');
let app;

let res_func = (err, res, next) => {
    console.log("erorrs", err);
    if(err){
        res.status(400).json({"status":'fail', "err": err, "msg":"Validations Error"});
    } else {
        next();        
    }  
}

let init = function(application){
    console.log("user validation")
    app = application;
}

let isAdmin = (user_role)=>{
    if(user_role == 'admin'){
        return true;
    } else {
        return false;
    }
}

let email_unique = (email, name, cb) =>{
    let db = app.db.model('User');
    db.findOne({"email":email}, (err, r_data) => {
        if(err){
            cb({"err": true, "msg": err});
        } else if (!r_data){
            cb({"err": false, "status":true, "msg": "email avaliable to use"});
        } else {
            if(name && (name == r_data.name )){
                cb({"err": false, "status":true, "msg": "email avaliable to use"});
            } else {
                cb({"err": false, "status":false, "msg": "email not avaliable to use"});
            }
        }
    })
}

let empty_check = { notEmpty: true, errorMessage:"field is required"}
let email_check = { notEmpty: true, isEmail: true, errorMessage:"Invalid data"}
let mongo_id    = { notEmpty: true, isMongoId: true, errorMessage:"Invalid data"}

let create = (req, res, next)=>{
    if(req.body.req_user.role != 'admin'){
        return res.status(401).json({"err":"Unauthorized Access"});
    }

    req.checkBody({ 
        name      : empty_check,
        email     : email_check,
        empid     : empty_check,
        password  : empty_check,
        role      : empty_check
    });

    req.checkBody('role').isIn(['creator', 'viewer']);

    const err = req.validationErrors();
    if(err){
        return res.status(400).json({"status":'fail', "err": err, "msg":"Validations Error"});
    }
    
    let user_db = app.db.model('User');
    user_db.findOne({"email":req.body.email}).then((user_data)=>{
        if(user_data){
            let err = new Error();
            err.name = "custom", err.status = "200", err.msg= "Email Already Exist";
            throw err;
        } else {
            return  user_db.findOne({"empid":req.body.empid}).exec();
        }
    }).then((empid_data)=>{    
        if(empid_data){
            let err = new Error();
            err.name = "custom", err.status = "200", err.msg= "Empid Already Exist";
            throw err;
        } else {
            next();
        }
    }).catch((err)=>{
        if(err.name=='custom'){
            return res.status(err.status).json({"err":err.msg});
        } else {
            return res.status(500).json({"err":"Internal Server Error"});
        }
    })
}

let emailcheck = (req, res, next)=>{
    req.checkParams({ 
        email     : email_check
    });
    const err = req.validationErrors();
    if(err){
        return res.status(400).json({"status":'fail', "err": err, "msg":"Validations Error"});
    }
    let user_db     = app.db.model('User');
    let user_email  = req.params.email;
    user_db.findOne({"email": user_email}, (err, r_data)=>{
        if(err){
          app.logger.log(3, "emailcheck", 'emailcheck Mongodb : Error', path.basename(__filename), app.utility.getIp(req), err);
          return res.status(500).json({"status":'fail', "err": "Internal Server Error"});
        } else if (!r_data){
          return res.status(404).json({"status":"fail", "msg":"User Not Found"});
        } else {
          next();
        }
    })
}

let check_mongo_id = (req, res, next)=>{
    req.checkParams({
        id  :  mongo_id
    });

    const err = req.validationErrors();
    if(err){
        return res.status(400).json({"status":'fail', "err": err, "msg":"Validations Error"});
    } else {
        console.log("here");
        next();
    }
}

let get_users = (req, res, next)=>{
    if(!isAdmin(req.body.req_user.role)){
        return res.status(403).json({"err":"Forbidden"});
    } 
    req.checkParams({
        index  :  { notEmpty: true, isInt:true, errorMessage:"Inavlid parameter"},
        count  :  { notEmpty: true, isInt:true, errorMessage:"Inavlid parameter"}
    });
    let err = req.validationErrors();
    res_func(err, res, next);
}

let mongo_ids = (req, res, next)=>{
    if(!isAdmin(req.body.req_user.role)){
        return res.status(403).json({"err":"Forbidden"});
    } 
    req.checkBody({
        "user_ids": { notEmpty: true, isArray:true, errorMessage:"Invalid parameter"}
    })
    req.checkBody('user_ids').eachIsMongoId('user');
    
    let err = req.validationErrors();
    res_func(err, res, next);
}

let action = (req, res, next)=>{
    if(!isAdmin(req.body.req_user.role)){
        return res.status(403).json({"err":"Forbidden"});
    } 
    req.checkBody({
        "user_ids": { notEmpty: true, isArray:true, errorMessage:"Invalid parameter"},
        "action"  : { notEmpty: true, 
                      isIn: { options: [['A', 'I']],
                        errorMessage: 'invalid Action'
                      }, errorMessage: "Action required"  } 
    })
    let err = req.validationErrors();
    res_func(err, res, next);
}

module.exports = {
    init            : init,
    create          : create,
    validate_id     : check_mongo_id,
    emailcheck      : emailcheck,
    get_users       : get_users,
    mongo_ids       : mongo_ids,
    action          : action
}
