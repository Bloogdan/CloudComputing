var http = require('http');
var https = require('https');
var fs = require('fs');
var rq = require('request');
var readline = require('readline');
var consts = require("./config.js");
var logfile = "log.txt";

var server = http.createServer((request, response) => {
    if (request.url.indexOf(".css") !== -1) {

        var file = fs.readFileSync(`.${request.url}`, { 'encoding': 'utf8' });
        response.writeHead(200, { 'Content-Type': 'text/css' });
        response.write(file);
        response.end();
    }
    else if (request.url == "/metrics") {
        var myhtml = fs.readFileSync("./header.html").toString();
        const readInterface = readline.createInterface({
            input: fs.createReadStream(logfile),
            output: process.stdout,
            console: false
        });

        readInterface.on('line', function (line) {
            myhtml = myhtml.concat(`<p>${line}</p>`);
        });

        readInterface.on('close', function () {
            myhtml = myhtml.concat(fs.readFileSync("./footer.html").toString());
            response.writeHead(200, { 'Content-type': 'text/html' });
            response.write(myhtml);
            response.end();
        });

    } else if (request.url != "/favicon.ico") {
        var myhtml = fs.readFileSync("./header.html").toString();
        if (request.method == "POST") {
            //console.log("Got request");
            console.log("Request");
            var url = `https://sv443.net/jokeapi/v2/joke/Any?blacklistFlags=nsfw&type=twopart`;

            fs.appendFile(logfile, "{ request: \"" + url + "\" }\n", function (err) {
                if (err) throw err;
            });

            https.get(url, (res) => {
                var body = "";

                res.on('data', (chunk) => {
                    body += chunk;
                });

                res.on('end', () => {
                    fs.appendFile(logfile, "{ response: " + body + " }\n", function (err) {
                        if (err) throw err;
                    });
                    var text0 = JSON.parse(body).setup;
                    var text1 = JSON.parse(body).delivery;
                    //console.log(text0);
                    //console.log(text1);
                    var url = `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${consts.translateAPIKEY}&text=${text0}&text=${text1}&lang=en-ro`;
                    //console.log("url:" + url);

                    fs.appendFile(logfile, "{ request: \"" + url + "\" }\n", function (err) {
                        if (err) throw err;
                    });

                    https.get(url, (res) => {
                        var body = "";

                        res.on('data', (chunk) => {
                            body += chunk;
                        });

                        res.on('end', () => {
                            fs.appendFile(logfile, "{ response: " + body + " }\n", function (err) {
                                if (err) throw err;
                            });
                            translated = JSON.parse(body).text;
                            //console.log(translated[0]);
                            //console.log(translated[1]);

                            var url = 'https://api.imgflip.com/caption_image';
                            var params = `template_id=8072285&username=${consts.imgflipUsername}&password=${consts.imgflipPassword}&font=impact&max_font_size=150&boxes[0][text]=${translated[0]}&boxes[0][x]=50&boxes[0][y]=0&boxes[0][width]=500&boxes[0][height]=150&boxes[0][color]=#ffffff&boxes[0][outline_color]=#000000&boxes[1][text]=${translated[1]}&boxes[1][x]=50&boxes[1][y]=400&boxes[1][width]=500&boxes[1][height]=150&boxes[1][color]=#ffffff&boxes[1][outline_color]=#000000`;


                            fs.appendFile(logfile, "{ request: \"" + url + params + "\" }\n", function (err) {
                                if (err) throw err;
                            });

                            rq.post({
                                headers: { 'content-type': 'application/x-www-form-urlencoded' },
                                url: url,
                                body: params
                            }, function (error, res, body) {
                                fs.appendFile(logfile, "{ response: " + body + " }\n", function (err) {
                                    if (err) throw err;
                                });
                                //console.log(JSON.parse(body).data.url);
                                myhtml = myhtml.concat(fs.readFileSync("./form.html").toString());
                                myhtml = myhtml.concat(`<div><img src="${JSON.parse(body).data.url}"/></div>`)
                                myhtml = myhtml.concat(fs.readFileSync("./footer.html").toString());
                                //console.log(myhtml);
                                response.writeHead(200, { 'Content-type': 'text/html' });
                                response.write(myhtml);
                                response.end();
                            });

                        });
                    });
                });
            });
        } else {
            myhtml = myhtml.concat(fs.readFileSync("./form.html").toString());
            myhtml = myhtml.concat(fs.readFileSync("./footer.html").toString());
            //console.log(myhtml);
            response.writeHead(200, { 'Content-type': 'text/html' });
            response.write(myhtml);
            response.end();
        }
    }
});

server.listen(3000);
