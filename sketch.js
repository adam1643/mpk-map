var xhttp = new XMLHttpRequest();
bus = 128;
markers = []
res = 0
type = "bus";
coords = []

stopMarkers = []
polyline = 0;

xhttp.onreadystatechange = function() {
    if(xhttp.readyState == 4 && xhttp.status == 200) {
    res = xhttp.responseText;

    a = JSON.parse(res)
    coords = []
    for (v of a ){
        // console.log(v);
        coords.push([v.x, v.y])
    }

    for (m of markers) {
        if (m) {
            mymap.removeLayer(m);
        }
    }
    markers = []

    for (c of coords) {
        markers.push(L.marker([c[0], c[1]]).addTo(mymap));
    }

}
};

function test() {
    a = document.getElementsByName('fname');
    bus = a[0].value;
    if (bus > 0 && bus <= 33) {
        type = "tram";
    }
    else {
        type = "bus";
    }
    sendReq();
}

function sendReq() {
    var params = 'busList[' + type + '][]=' + bus;
    xhttp.open("POST", "http://mpk.wroc.pl/position.php", true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.send(params);
    loadDoc(bus);
}



var mymap = L.map('map').setView([51.127545, 17.03297], 12);

xxx = 0;
function loadDoc(line) {
    line = line.toString();
    var uri;
    if(line.length == 1) {
        uri = "./xml/000" + line + "/000" + line + ".xml";
    } else if(line.length == 2) {
        uri = "./xml/00" + line + "/00" + line + ".xml";
    } else {
        uri = "./xml/0" + line + "/0" + line + ".xml";
    }
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", uri, false);
    xhttp.send();
    xxx = xhttp.responseXML;
    console.log(xhttp.responseXML);
    chLen = xxx.firstChild.firstElementChild.firstElementChild.children.length;
    childs = xxx.firstChild.firstElementChild.firstElementChild.children;

    stopMarkers = []
    var latlngs = Array();
    for (ch of childs) {
        iid = ch.getAttribute("id")
        // console.log(iid);
        s = findStop(iid);
        console.log(s);
        // console.log(s[0].stop_lat, s[0]["stop_lon\r"]);
        if(s.length == 0) {continue;};
        mrk = L.marker([s[0].stop_lat, s[0]["stop_lon\r"]]);
        stopMarkers.push(mrk);

        
        latlngs.push(mrk.getLatLng());
        
    }
    if(polyline) mymap.removeLayer(polyline);
    polyline = L.polyline(latlngs, {color: 'red'}).addTo(mymap);
}
allStops = [];
function testtest() {
    var xhttp1 = new XMLHttpRequest();
    xhttp1.open("GET", "./stops.txt", false);
    xhttp1.send();
    xxx1 = xhttp1.responseText;

        // Split the input into lines
    lines = xxx1.split('\n'),

        // Extract column names from the first line
    columnNamesLine = lines[0],
    columnNames = parse(columnNamesLine),
    
        // Extract data from subsequent lines
    dataLines = lines.slice(1),
    data = dataLines.map(parse);
    
    // Prints ["foo, the column","bar"]
    // console.log(JSON.stringify(columnNames));
    
    // Prints [["2","3"],["4, the value","5"]]
    var dataObjects = data.map(function (arr) {
        var dataObject = {};
        columnNames.forEach(function(columnName, i){
          dataObject[columnName] = arr[i];
        });
        return dataObject;
      });
    allStops = dataObjects;
      // Prints [{"foo":"2","bar":"3"},{"foo":"4","bar":"5"}]
      console.log(JSON.stringify(dataObjects[0]));

}

function findStop(id) {
    objs = []
    for (obj of allStops) {
        if (obj['stop_code'] == id) {
            objs.push(obj);
        }
    }
    return objs;
}

function parse(row){
    var insideQuote = false,                                             
        entries = [],                                                    
        entry = [];
    row.split('').forEach(function (character) {                         
      if(character === '"') {
        insideQuote = !insideQuote;                                      
      } else {
        if(character == "," && !insideQuote) {                           
          entries.push(entry.join(''));                                  
          entry = [];                                                    
        } else {
          entry.push(character);                                         
        }                                                                
      }                                                                  
    });
    entries.push(entry.join(''));                                        
    return entries;                                                      
  }

testtest();
loadDoc(128);

sendReq();
setInterval(sendReq, 5000);
// var marker = L.marker([51.077545, 16.983297]).addTo(mymap);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);
