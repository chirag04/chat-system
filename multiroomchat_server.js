var fs = require('fs');
var url  = require('url');
var path = "";
var server = require('http').createServer(function(req, response){
    path = url.parse(req.url).pathname;
    if(path=='/admin'){
	    fs.readFile(__dirname+'/admin.html', function(err, data){
	    response.writeHead(200, {'Content-Type':'text/html'});
	    response.write(data);
	    response.end();
	    });
    }else{
	    fs.readFile(__dirname+'/buyer.html', function(err, data){
	    response.writeHead(200, {'Content-Type':'text/html'});
	    response.write(data);
	    response.end();
	    });
    }
});
server.listen(8080);


var nowjs = require("now");
var everyone = nowjs.initialize(server);

var admin_id = 0;

nowjs.on('connect', function(){
  if( path == "/admin") {
        admin_id = this.user.clientId;
  } else {

	if(admin_id!=0){
          username = this.now.name;
          client_id = this.user.clientId; 
	  	  nowjs.getGroup(client_id).addUser(admin_id);
	  	  nowjs.getGroup(client_id).addUser(client_id);
          nowjs.getClient(admin_id, function () {
	      		this.now.add_buyer(username,client_id);
	  	  });
	  }else{
	    	this.now.receiveMessage("Admin","We are offline now.Contact later!");
            this.now.deletechat();
	 }
  }
});

nowjs.on('disconnect', function(){
    if(this.user.clientId!=admin_id){
        clientid = this.user.clientId;
        nowjs.getGroup(this.user.clientId).removeUser(this.user.clientId);
		if(admin_id!=0){
		    nowjs.getGroup(this.user.clientId).removeUser(admin_id);
			nowjs.getClient(admin_id, function(){ 
			    this.now.remove_buyer(clientid);
			});
		}
    }else{
		everyone.now.deletechat();
		admin_id=0;
    }
});

everyone.now.distributeMessage = function(message,isadmin,room){
    if(isadmin){
	nowjs.getGroup(room).now.receiveMessage(this.now.name, message);
    }else {
	nowjs.getGroup(this.user.clientId).now.receiveMessage(this.now.name, message);
    }
};
