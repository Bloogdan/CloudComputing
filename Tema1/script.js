async function f() {
    var url = "http://localhost:3000/";
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var xhr = new XMLHttpRequest();

    xhr.open('POST', url, true);
    xhr.send();
}

for (var i = 0; i < 50; i++) {
    f();
}