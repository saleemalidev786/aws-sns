var AWS = require('aws-sdk'); 
var util = require('util');
var config = require('./config.json');

// configure AWS
AWS.config.update({
  'region': 'ap-south-1'
});

var sns = new AWS.SNS();

//console.log(config.TopicArn);
// TopicArn : config.TopicArn,
function publish() {
  var publishParams = { 
    TopicArn : config.TopicArn,
    Subject: "Simple Notofocation Demo",
    Message : "Publishing Topic From Node JS"
  };


  console.log("PubParams",publishParams);
  sns.publish(publishParams, function(err, data) {
    if(err){
      console.log("ERROR WHILE PUBLISHING TOPIC:"+"\n  ",err);
    }else{
      process.stdout.write(".");
      console.log("SUCCESSFULLY PUBLISHED:"+ "\n  ",data);
    }
  });
}

publish();

