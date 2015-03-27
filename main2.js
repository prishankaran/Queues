var redis = require('redis')
var multer  = require('multer')
var express = require('express')
var fs      = require('fs')
var app = express()
var client = redis.createClient(6379, '127.0.0.1', {})
//var value=9;
var a;
var mylist= [];
var htmlpage=[];
var imagelist="imagelist";
//client.set("a", "this message will self-destruct in 10 seconds");

//client.get("a", function(err,value){console.log(value);a=value;});

//client.expire("a", 10);

//client.get("a", function(err,value){a=value;});
// REDIS
//var client = redis.createClient(6379, '127.0.0.1', {})

///////////// WEB ROUTES

// Add hook to make it easier to get all visited URLS.




app.use(function(req, res, next) 
{
	console.log(req.method, req.url);

	// ... INSERT HERE.
	client.lpush(mylist, req.url, function(err,value){console.log(value)});
	//console.log(mylist);
	client.ltrim(mylist,0,4, function(err,value){console.log(value)} );
	client.lrange(mylist,0,4, function(err,value){htmlpage=value});


	next(); // Passing the request to the next handler in the stack.
});
app.use('/uploads', express.static(__dirname+'/uploads'));


app.get('/recent', function(req, res) {
  res.send(htmlpage)
})

app.get('/get', function(req, res) {
  client.get("a", function(err,value){console.log(value);});
  client.get("a", function(err,value){a=value;});
  res.send(a)
})

app.get('/set', function(req, res) {
client.set("a", "this message will self-destruct in 10 seconds");
client.get("a", function(err,value){console.log(value);});
client.expire("a", 10);
res.send("OK!")
})

app.get('/', function(req, res) {
  res.send('hello world')
})


 app.post('/upload',[ multer({ dest: './uploads/'}), function(req, res){
    console.log(req.body) // form fields
    console.log(req.files) // form files

    if( req.files.image )
    {
 	   fs.readFile( req.files.image.path, function (err, data) {
 	  		if (err) throw err;
 	  		var img = new Buffer(data).toString('base64');
 	  	//	console.log(img);
 	  		client.rpush("imagelist",req.files.image.path);
 		});
 	}

    res.status(204).end()
 }]);

 app.get('/meow', function(req, res) {
 	{
    client.lpop("imagelist",function(err,data)
    {

 		res.writeHead(200, {'content-type':'text/html'});
 		//items.forEach(function (imagedata) 
 		console.log(data);
    		res.write("<h1>\n<img src='"+data+"'/>");
 		
    	res.end();
    });
 	}
 })

// HTTP SERVER
 var server = app.listen(3001, function () {

   var host = server.address().address
   var port = server.address().port

   console.log('Example app listening at http://%s:%s', host, port)
 })

 

