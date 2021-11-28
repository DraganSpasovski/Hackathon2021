let busEx;
const getBtnBicikelj = document.getElementById('btnBicikeLJ');
const getBtnLpp = document.getElementById('btnLPP');
var dropdown = document.getElementsByClassName("dropdown-btn");
// trenutno se neuporabno
//busRTExample()

let busInfo = new L.circle([46.051318465073795, 14.479674887201202], {radius: 20, color: "black", fillOpacity: 0.8}).addTo(map);
// TODO: implement avtobus info
busInfo.bindPopup("<b>registracija:</b> LJ-LPP-439" +
               "<br><b>pot:</b> KOLODVOR" + 
               "<br><b>Kapaciteta:</b> 80" +
               "<br><b>Zasedenost:</b> 32" +
               "<br><b>Hitrost:</b> 53");
               /* if its possible to display this data, then uncomment
               "<br><br><b>Lokacija:</b> ZOO" +
               "<br><b>Naslednja postaja:</b> Večna pot" +
               "<br><b>Prihod do naslednje postaje:</b> 2 minuti");*/
// spreminjanje lokacije
//busInfo.setLatLng([46.056129458185, 14.472137335197804]);


function sleep(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

var leafIcon = L.Icon.extend({
    options:{
        iconSize:     [22,33], // size of the icon
        popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
    }
});

var greenIcon = new leafIcon({
    iconUrl: 'Untitled-1.svg'
});
var greenIcon2 = new leafIcon({
    iconUrl: 'Untitled-2.svg'
});

function busRTExample()
{
    busEx = new L.circle([46.052129458185, 14.472137335197804], {radius: 20}).addTo(map);
    
    fetch("https://api.ontime.si/api/v1/lpp/route-shapes/?groups=18")
        .then(response => response.json())
        .then(data =>
            {
                let data_len = data.results[0].trips[0].shape.length;

                for(let i = 0; i < data_len; i++)
                {
                    // TODO: implement sleep
                    // moralo bi premikati avtobus, vendar sleep ne dela
                    busEx._latlng.lat = data.results[0].trips[0].shape[i].lat;
                    busEx._latlng.lng = data.results[0].trips[0].shape[i].lng;
                }
            } )
        .catch(e => console.log(e))
}

const getBtn = document.getElementById('getBtn');
const getBtnAdd = document.getElementById('getBtnAdd');
const getBtnSosed = document.getElementById('getBtnSosed');
var routes = [];

let dataMissing=true;
let schedule="<b>PRIHODI AVTOBUSOV</b><br><br>";
var bus;
let activeBuses= new Set();
function cur_bus()
{
    bus = document.getElementById('bus').value;
    activeBuses.add(bus);
}
let markerList = [];
let stationID = 0;
const getData = () => fetch("https://api.ontime.si/api/v1/lpp/stops/?page_size=1367")
.then(response => response.json())
.then(data =>
    {
    
        layerGroup.clearLayers();
        activeBuses.clear();
        activeBuses.add(bus);
        
        //layerGroupBikes.clearLayers();
        for (result in data.results)
        { 
            if (data.results[result].route_groups.includes(bus))
            {   
                let marker = new L.marker([data.results[result].lat,data.results[result].lng],{icon: greenIcon2}).on('click', markerOnClick).addTo(layerGroup)
                marker.bindTooltip(data.results[result].stop_id + "_" + data.results[result].name);
                markerList.push(marker);
            }
        }
    } )
.catch(e => console.log(e))

const getDataAdd = () => fetch("https://api.ontime.si/api/v1/lpp/stops/?page_size=1367")
.then(response => response.json())
.then(data =>
    {
        for (result in data.results)
        { 
            if (data.results[result].route_groups.includes(bus))
            {   
                let marker = new L.marker([data.results[result].lat,data.results[result].lng],{icon: greenIcon2}).on('click', markerOnClick).addTo(layerGroup)
                marker.bindTooltip(data.results[result].stop_id + "_" + data.results[result].name);
                markerList.push(marker);
            }
        }
    } )
.catch(e => console.log(e))

function getRandomColor(x) {
	return x.toString(16);
}
const getShape1 = () => fetch("https://api.ontime.si/api/v1/lpp/route-shapes/?groups="+bus)
.then(response => response.json())
.then(data =>
    {
        let data_len = data.results[0].trips[0].shape.length;
        let latlngs = [];
        for(let i = 0; i < data_len; i++)
        { 
            latlngs.push([data.results[0].trips[0].shape[i].lat, data.results[0].trips[0].shape[i].lng]);
        }
        var polyline = L.polyline(latlngs, {color: "#" + ((1<<24)*Math.random() | 0).toString(16), opacity: 0.6,weight: 10, smoothFactor: 1}).bindPopup("Linija: "+bus).addTo(layerGroup);
        map.fitBounds(polyline.getBounds());
    } )
.catch(e => console.log(e))

const getShape2 = () => fetch("https://api.ontime.si/api/v1/lpp/route-shapes/?groups="+bus)
.then(response => response.json())
.then(data =>
    {
        let data_len = data.results[0].trips[1].shape.length;
        let latlngs = [];
        for(let i = 0; i < data_len; i++)
        { 
            latlngs.push([data.results[0].trips[1].shape[i].lat, data.results[0].trips[1].shape[i].lng]);
        }
        var polyline = L.polyline(latlngs, {color: "#" + ((1<<24)*Math.random() | 0).toString(16), opacity: 0.6, weight: 10, smoothFactor: 1}).bindPopup("Linija: "+bus).addTo(layerGroup);   
        map.fitBounds(polyline.getBounds());
    

    } )
.catch(e => console.log(e))

const getSchedule = () => fetch("https://api.ontime.si/api/v1/lpp/stops/"+stationID)
    .then(response => response.json())
    .then(data =>
        {
            let allArrivalTimes = [];
            let routes = [];
            for(timetable in data.timetable){
                if(activeBuses.has(data.timetable[timetable].group)){
                    routes.push(data.timetable[timetable].name);
                    let arrivalTimes=[];
                    for(arrival in data.timetable[timetable].arrivals){
                        let hour = data.timetable[timetable].arrivals[arrival].hour;
                        if(hour<10){
                            hour=0+""+hour;
                        }
                        let minute = data.timetable[timetable].arrivals[arrival].minute;
                        if(minute<10){
                            minute=0+""+minute;
                        }
                        arrivalTimes.push(hour+":"+minute);
                    }
                    allArrivalTimes.push(arrivalTimes);
                };
            }    
            if(routes.length!=0&&allArrivalTimes.length!=0){
                dataMissing=false;
            }
            schedule = "<b>PRIHODI AVTOBUSOV</b><br><br>";
            for(index in routes){
                schedule+="<b>SMER - "+routes[index]+"</b><br>";
                for(i in allArrivalTimes[index]){
                    schedule+=allArrivalTimes[index][i]+"<br>";
                }
                schedule+="<br>";
            }
        } )
    .catch(e => console.log(e))


const getBikes = () => fetch("https://api.ontime.si/api/v1/bicikelj/")
.then(response => response.json())
.then(data =>
    {
        
        // clear map if not clicked in
        if(!bicikeljRunning)
        {
            bicikeljRunning = true;
            
            for(bikeLoc in data.results)
            {
                //console.log(data.results[bikeLoc].total_stands * 0.8)
                if(data.results[bikeLoc].total_stands * 0.8 <= data.results[bikeLoc].available_bikes)
                {
                    const c = L.circle([data.results[bikeLoc].lat,data.results[bikeLoc].lng],{radius: 20,color: 'green'}).bindPopup(
                        "Število prostih koles: "+ data.results[bikeLoc].available_bikes+"<br>Število prostih mest: "+data.results[bikeLoc].available_stands).addTo(layerGroupBikes)
                }
                else if(data.results[bikeLoc].available_bikes <= data.results[bikeLoc].total_stands * 0.2)
                {
                    const c = L.circle([data.results[bikeLoc].lat,data.results[bikeLoc].lng],{radius: 20,color: 'red'}).bindPopup(
                        "Število prostih koles: "+ data.results[bikeLoc].available_bikes+"<br>Število prostih mest: "+data.results[bikeLoc].available_stands).addTo(layerGroupBikes)
                }
                else
                {
                    const c = L.circle([data.results[bikeLoc].lat,data.results[bikeLoc].lng],{radius: 20,color: 'orange'})
                    .bindPopup(
                        "Število prostih koles: "+ data.results[bikeLoc].available_bikes+"<br>Število prostih mest: "+data.results[bikeLoc].available_stands).addTo(layerGroupBikes)
                }
            }
        } else {
            bicikeljRunning = false;
            layerGroupBikes.clearLayers();
        }
    }
)
.catch(e => console.log(e))

// clear map when not clicked in
function setBusData()
{
    if(!lppRunning){
        lppRunning = true;
    } else {
        lppRunning = false;
        layerGroup.clearLayers();
        activeBuses.clear();
    }
}

let lat_max;
let lat_min;
let lng_max;
let lng_min;

navigator.geolocation.getCurrentPosition(success,console.log)

function success(pos)
{
    lat_max = pos.coords.latitude + 0.0067
    lat_min = pos.coords.latitude - 0.0067
    lng_max = pos.coords.longitude + 0.0067
    lng_min = pos.coords.longitude - 0.0067
    L.marker([pos.coords.latitude,pos.coords.longitude]).bindPopup("Tvoja Lokacija").openPopup().addTo(map);
   
}

const nearPostaje = async () => fetch("https://api.ontime.si/api/v1/lpp/stops/?lat_min="+lat_min+"&lat_max="+lat_max+"&lng_min="+lng_min+"&lng_max="+lng_max)
.then(response => response.json())
.then(async data => 
    {   
        for(postaja in data.results)
        {
            for(buskee in data.results[postaja].route_groups)
            {
                activeBuses.add(data.results[postaja].route_groups[buskee])
            }
            
            L.marker([data.results[postaja].lat,data.results[postaja].lng],{icon: greenIcon}).addTo(layerGroup);

        }
        for (let item of activeBuses.values())
            {
                await sleep(700)
                bus=item;
                getShape1()
                getShape2()
            } 
    })

let bicikeljRunning = false;
let lppRunning = false;

getBtn.addEventListener('click', cur_bus);
getBtn.addEventListener('click', getData);
getBtn.addEventListener('click', getShape1);
getBtn.addEventListener('click', getShape2);
getBtnBicikelj.addEventListener('click', getBikes);
getBtnLpp.addEventListener('click', setBusData)
getBtnAdd.addEventListener('click', cur_bus);
getBtnAdd.addEventListener('click', getDataAdd);
getBtnAdd.addEventListener('click', getShape1);
getBtnAdd.addEventListener('click', getShape2);
getBtnSosed.addEventListener('click', nearPostaje);


async function markerOnClick(e)
{
    stationID=e.target._tooltip._content.split("_")[0];
    getSchedule();
    while(schedule=="<b>PRIHODI AVTOBUSOV</b><br><br>"){
        console.log("waiting data");
        await sleep(100);
    }
    if(dataMissing){
        alert("Podatki za postajo trenutno manjkajo. Poskustie znova.");
        return;
    }
    e.target.bindPopup(schedule).openPopup();
    e.target.unbindPopup();
    schedule="<b>PRIHODI AVTOBUSOV</b><br><br>";
    dataMissing=true;
}
