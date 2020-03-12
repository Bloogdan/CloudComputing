var http = require('http');
var consts = require("./config.js");

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test2', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

var customerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    middleName: {
        type: String
    },
    telephoneNumber: {
        type: String
    }
});

var Customer = mongoose.model('Customer', customerSchema);

var server = http.createServer((req, res) => {
    var url = req.url.split("/");
    var method = req.method;
    if (url[1] == "api" && url[2] == "customers") {
        if (method == "GET") {
            if (url[3] == undefined) {
                Customer.find(function (err, customers) {
                    if (err) {
                        res.writeHead(consts.HTTP_BAD_REQUEST);
                        res.end();
                    }
                    else {
                        res.writeHead(consts.HTTP_OK, {
                            "content-type": "application/json"
                        });
                        var array = customers.map(function (customer) { return customer.toString(); });
                        res.write(array.toString());
                        res.end();
                    }
                });
            }
            else if (url[4] == undefined || url[4] == "") {
                Customer.findById(url[3], function (err, customer) {
                    if (err) {
                        res.writeHead(consts.HTTP_NOT_FOUND);
                        res.end();
                    }
                    else {
                        res.writeHead(consts.HTTP_OK, {
                            "content-type": "application/json"
                        });
                        res.write(customer.toString());
                        res.end();
                    }
                });
            }
            else {
                res.writeHead(consts.HTTP_NOT_FOUND);
                res.end();
            }
        }
        else if (method == "POST") {
            if (url[3] == undefined) {
                var body = [];
                req.on('data', (chunk) => {
                    body.push(chunk);
                }).on('end', () => {
                    body = Buffer.concat(body).toString();
                    // at this point, `body` has the entire request body stored in it as a string
                    body = JSON.parse(body);
                    var newCustomer = new Customer(body);
                    newCustomer.save(function (err, newCustomer) {
                        if (err) {
                            res.writeHead(consts.HTTP_BAD_REQUEST);
                            res.end();
                        }
                        else {
                            res.writeHead(consts.HTTP_CREATED);
                            res.end();
                        }
                    })
                });
            }
            else if (url[4] == undefined || url[4] == "") {
                res.writeHead(consts.HTTP_METHOD_NOT_ALLOWED);
                res.end();
            }
            else {
                res.writeHead(consts.HTTP_NOT_FOUND);
                res.end();
            }
        }
        else if (method == "PUT") {
            if (url[3] == undefined) {
                res.writeHead(consts.HTTP_METHOD_NOT_ALLOWED);
                res.end();
            }
            else if (url[4] == undefined || url[4] == "") {
                var body = [];
                req.on('data', (chunk) => {
                    body.push(chunk);
                }).on('end', () => {
                    body = Buffer.concat(body).toString();
                    // at this point, `body` has the entire request body stored in it as a string
                    body = JSON.parse(body);
                    Customer.findByIdAndUpdate(url[3], body, function (err) {
                        if (err) {
                            res.writeHead(consts.HTTP_NOT_FOUND);
                            res.end();
                        }
                        else {
                            res.writeHead(consts.HTTP_OK);
                            res.end();
                        }
                    });
                });
            }
        }
        else if (method == "PATCH") {
            if (url[3] == undefined) {
                res.writeHead(consts.HTTP_METHOD_NOT_ALLOWED);
                res.end();
            }
            else if (url[4] == undefined || url[4] == "") {
                var body = [];
                req.on('data', (chunk) => {
                    body.push(chunk);
                }).on('end', () => {
                    body = Buffer.concat(body).toString();
                    // at this point, `body` has the entire request body stored in it as a string
                    body = JSON.parse(body);
                    Customer.findByIdAndUpdate(url[3], body, function (err) {
                        if (err) {
                            res.writeHead(consts.HTTP_NOT_FOUND);
                            res.end();
                        }
                        else {
                            res.writeHead(consts.HTTP_OK);
                            res.end();
                        }
                    });
                });
            }
        }
        else if (method == "DELETE") {
            if (url[3] == undefined) {
                res.writeHead(consts.HTTP_METHOD_NOT_ALLOWED);
                res.end();
            }
            else if (url[4] == undefined || url[4] == "") {
                Customer.findByIdAndDelete(url[3], function (err) {
                    if (err) {
                        res.writeHead(consts.HTTP_NOT_FOUND);
                        res.end();
                    }
                    else {
                        res.writeHead(consts.HTTP_OK);
                        res.end();
                    }
                });
            }
        }
    }
});

server.listen(3000);
