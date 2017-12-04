var AWS = require('aws-sdk'); 
var util = require('util');
var async = require('async');
var fs = require('fs');


var config = {};
// configure AWS
AWS.config.update({
  'region': 'ap-south-1',
  'accessKeyId': 'AKIAJ6S4XXCS5HPHCAYQ',
  'secretAccessKey': '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'
});

var sns = new AWS.SNS();
var sqs = new AWS.SQS();




function createNewTopic(cb){
  
  sns.createTopic({
      'Name': 'Topic_3'
    }, function (err, result) {

    if (err !== null) {
        console.log("ERROR IN CREATE TOPIC: ",util.inspect(err));
        //return;
    }
    config.TopicArn= result.TopicArn;
    console.log("1) Topic Created Successfully : "+ "\n  ",util.inspect(result));
    createQueue();
  });
};


//=======CREATE QUEUE ===========
function createQueue(cb) {
  sqs.createQueue({
    'QueueName': 'Sample_Queue'
  }, function (err, result) {

    if (err !== null) {
      console.log(util.inspect(err));
      return err;
    }

    //console.log(util.inspect(result));
    console.log("\n"+"2) Queue Created Successfully: "+ "\n  ", result);
    config.QueueUrl = result.QueueUrl;
    

    getQueueAttr();

  });

};


function getQueueAttr(cb) {
  sqs.getQueueAttributes({
    QueueUrl: config.QueueUrl,
  AttributeNames: ["QueueArn"]
  }, function (err, result) {

    if (err !== null) {
      console.log(util.inspect(err));
      return cb(err);
    }

    console.log(util.inspect(result));

    config.QueueArn = result.Attributes.QueueArn;
    console.log("3) GET QUEUE ATTRIBUTE: " + "\n  ",config.QueueArn);
    snsSubscribe();

  });
};


//=====SNS Subscription=============
function snsSubscribe(cb) {
  // console.log("FROM SUBS",config.TopicArn);
  sns.subscribe({
    'TopicArn': config.TopicArn,
    'Protocol': 'sqs',
    'Endpoint': config.QueueArn
  }, function (err, result) {

    if (err !== null) {
      console.log(util.inspect(err));
      return err;
    }

    console.log("4)  Successfully Subscribed:"+ "\n  ",util.inspect(result));

    setQueueAttr();
  });

};

function setQueueAttr(cb) {
  console.log("QURL FROM AETQATT:",config.QueueUrl);
  var queueUrl = config.QueueUrl;
  var topicArn = config.TopicArn;
  var sqsArn = config.QueueArn;

  var attributes = {
    "Version": "2008-10-17",
    "Id": sqsArn + "/SQSDefaultPolicy",
    "Statement": [{
      "Sid": "Sid" + new Date().getTime(),
      "Effect": "Allow",
      "Principal": {
        "AWS": "*"
      },
      "Action": "SQS:SendMessage",
      "Resource": sqsArn,
      "Condition": {
        "ArnEquals": {
          "aws:SourceArn": topicArn
        }
      }
    }
    ]
  };

  sqs.setQueueAttributes({
    QueueUrl: queueUrl,
    Attributes: {
      'Policy': JSON.stringify(attributes)
    }
  }, function (err, result) {

    if (err !== null) {
      console.log(util.inspect(err));
      return err;
    }

    console.log("5)  Attribute Set Done: "+"\n  ",util.inspect(result));

    writeConfigFile();
  });

}

function writeConfigFile(cb) {
  fs.writeFile('config.json', JSON.stringify(config, null, 4), function(err) {
    if(err) {
      return err;
    }

    console.log("6) config saved to config.json");
   // cb();
  }); 

};

createNewTopic();

// async.series([
    
//    ]

// );
// async.series([createTopic]);


