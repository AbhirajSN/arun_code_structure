var config;
var fs        = require('fs')
var conf_path = '/etc/nodelearning/nodeconfig_auth.json';

module.exports = function(env) {
    console.log('env', env);
    if(fs.existsSync(conf_path)){
      console.log('file exist in conf_path');
      return (require(conf_path));
    } else {}
}