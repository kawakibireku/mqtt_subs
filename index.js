var mqtt = require('mqtt');
// var https = require('https');
var Topic = 'organization/DAS/application/EnergyMeter-CL710K22/node/0800000040000202/rx';
var Broker_URL = 'mqtt://asia.srv.sindconiot.com';
var message_will_be_parsing;
var options = {
    clientId: 'beffcafeb26c4a6e8e98154a788c9620',
    username:'_APP_telkom',
    password: 'ct4Rxsx1Kr77',
    port: 1883,
    keepalive: 60
}
var request = require("request");
var antares_json;


var client = mqtt.connect(Broker_URL,options);
client.on('connect', mqtt_connect);
// client.on('reconnect', mqtt_reconnect);
client.on('error', mqtt_error);
client.on('message', mqtt_messsageReceived);
// client.on('close', mqtt_close);


function mqtt_connect()
{
    console.log("Connecting MQTT");
    client.subscribe(Topic, mqtt_subscribe);
}

function mqtt_subscribe(err, granted)
{
    console.log("Subscribed to " + Topic);
    if (err) {console.log(err);}
}

function mqtt_reconnect(err)
{
    console.log("Reconnect MQTT");
    if (err) {console.log(err);}
	client  = mqtt.connect(Broker_URL, options);
}

function mqtt_error(err)
{
    console.log("Error!");
	if (err) {console.log(err);}
}

function after_publish()
{
	//do nothing
}

function mqtt_messsageReceived(topic, message, packet)
{
    message_will_be_parsing = message;
    console.log('Topic=' +  topic + '  Message=' + message);
    var parsed_json = JSON.parse(message_will_be_parsing);
    // console.log(parsed_json.meter);
    // console.log(parsed_json.rxInfo);
    var meter_json = JSON.parse(JSON.stringify(parsed_json.meter));
    var rx_info = JSON.parse(JSON.stringify(parsed_json.rxInfo));
    // console.log(meter_json);
    // console.log(rx_info[0].name);
    
    antares_json = '{"m2m:cin": { "con": "{\\"mac\\": \\"'+rx_info[0].mac+'\\", \\"rssi\\":\\"'+rx_info[0].rssi+'\\", \\"name\\":\\"'+rx_info[0].name+'\\", \\"longitude\\": \\"'+rx_info[0].longitude+'\\", \\"latitude\\":\\"'+rx_info[0].latitude+'\\", \\"altitude\\": \\"'+rx_info[0].altitude+'\\", \\"meterReading\\": \\"'+meter_json.meterReading+'\\", \\"prepayment\\": \\"'+meter_json.prepayment+'\\", \\"pulseCount\\":\\"'+meter_json.pulseCount+'\\", \\"uptime\\":\\"'+meter_json.uptime+'\\", \\"alarm\\":\\"'+meter_json.alarm+'\\", \\"valve\\":\\"'+meter_json.valve+'\\", \\"battery\\":\\"'+meter_json.battery+'\\"}"}}';
    // console.log(antares_json);

    var antares_options = { method: 'POST',
                            url: 'https://platform.antares.id:8443/~/antares-cse/antares-id/SmartMeterPGN/meter1',
                            headers: 
                            { 'Postman-Token': '04fcf82f-d855-4e18-b6fd-a475eda07931',
                                'cache-control': 'no-cache',
                                'X-M2M-Origin': 'e7e349fc2216941a:9d0cf82c25277bdd',
                                Accept: 'application/json',
                                'Content-Type': 'application/json;ty=4' },
                                body: antares_json 
                            };

    request(antares_options, function (error, response, body) {
        if (error) throw new Error(error);
        console.log(body);
      });
    // console.log(antares_json);
}

function mqtt_close()
{
	console.log("Close MQTT");
}