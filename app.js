var express = require('express');
var http = require('http');
var fs = require('fs')
var cors = require('cors');
var app = express();
var request = require('request');
var Cloudant = require('cloudant');
var user = 'ramachandrar143'
var passwd = 'Ramachandrar143@gmail.com'
var rand = require('random-key')
var nodemailer = require('nodemailer');
var smtp = require('nodemailer-smtp-transport');
var cloudant = Cloudant({account:user,password:passwd});
var bodyParser = require('body-parser');
app.use(express.static(__dirname));
app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html')
})
app.get('/complaint',function(req,res){
    res.sendFile(__dirname+'/complaint.html')
})
app.get('/status',function(req,res){
    res.sendFile(__dirname+'/status.html')
})
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json());
var db = cloudant.db.use('hack')
app.post('/getLocation',function(req,res){
   var latitude = req.body.latitude;
    var longitude = req.body.longitude;
    set = 1;
    var flag = 0;
    var opt={
        url : 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location='+latitude+','+longitude+'&radius=500&key=AIzaSyCKnJC0FEOQjbxbXraTkkglb-Wfxjbozxk'
    }
    request(opt,function(err,resp,body){
        console.log(resp.body)
        var data = JSON.parse(resp.body);
        for(var i = 0; i<(data.results).length;i++){
            var lat = (data.results[i].geometry.location.lat).toFixed(4);
            var lon = (data.results[i].geometry.location.lng).toFixed(4);
            if(lat - latitude > 0.0001){
                var result = data.results[i].name +', '+data.results[i].vicinity;
                return res.json({"res":result})
                break;
            }

        }
        
    })
console.log('APi firred');
})
app.post('/petition',function(req,res){
    var ref = rand.generateBase30(5);
    console.log(ref)
    var dat = req.body
    db.insert({_id:ref,"data":dat},function(err,data){
        if(err){
            console.log(err)
        }
        else{
            console.log(data);
            var transport = nodemailer.createTransport(smtp( {
				service: 'hotmail',
				auth: {
				user: "ramachandrar143@hotmail.com",
				pass: "Dqcrg.123"
					}
				}));
			var message = {
				from: 'ramachandrar143@hotmail.com',
                to: 'ramachandrar143@gmail.com',
                cc:req.body.mail,
				subject: 'Complaint registered', 
				text: 'Dear' + req.body.name+'\n we are in action. you can track your complaint with '+ref+'. Thank you!'
			};
				transport.sendMail(message, function(error){
			if(error){
			console.log('Error occured');
			console.log(error.message);
			return;
			}
			console.log('Message sent successfully!');
			});
            return res.json({"RefId":ref})
        }
    })
})

app.get('/tweet',function(req,res){ 
    console.log(res);
})
app.post('/status',function(req,res){
    var ref = req.body.RefId;
    db.get(ref,function(err,data){
        if(err){
            console.log(data);
        }
        else{
            console.log(data);
            return res.json(data);
        }
    })
})
app.post('/update',function(req,res){
    console.log(req.body);
    var ref = req.body.ref.RefId;
    var id,rev,data;
    console.log(ref)
    db.get(ref,function(err,data){
        if(data){
            console.log(data)
            id = data._id;
            rev = data._rev;
            data = data.data;
            data.update = 'This complaint is already resolved!'
            db.insert({_id:id,_rev:rev,'data':data},function(err,data1){
                if(err){
                    console.log(err);
                }
                else
                    console.log(data1);
                var transport = nodemailer.createTransport(smtp( {
                    service: 'hotmail',
                    auth: {
                    user: "ramachandrar143@hotmail.com",
                    pass: "Dqcrg.123"
                        }
                    }));
                var message = {
                    from: 'ramachandrar143@hotmail.com',
                    to: data.mail,
                    subject: 'Complaint Resolved', 
                    text: 'Dear ' + data.name+'\n We resolved your complaint. \n Thank you!'
                };
                    transport.sendMail(message, function(error){
                if(error){
                console.log('Error occured');
                console.log(error.message);
                return;
                }
                console.log('Message sent successfully!');
                });
            })
        }
    })

    return res.json(data={
        "data":"updated"
    })
})

app.listen(process.env.PORT||3000,function(){
    console.log('At 3000')
})