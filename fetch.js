let busEx;
const getBtnBicikelj = document.getElementById('btnBicikeLJ');
// trenutno se neuporabno
//busRTExample()

let busInfo = new L.circle([46.051318465073795, 14.479674887201202], {radius: 20, color: "black", fillOpacity: 0.8}).addTo(map);
// TODO: implement avtobus info
busInfo.bindPopup("<b>registracija:</b> LJ-LPP-439" +
               "<br><b>pot:</b> KOLODVOR" + 
               "<br><b>Kapaciteta:</b> 80" +
               "<br><b>Zasedenost:</b> 32" +
               "<br><b>Hitrost:</b> 53");
               /*
               "<br><br><b>Lokacija:</b> ZOO" +
               "<br><b>Naslednja postaja:</b> Večna pot" +
               "<br><b>Prihod do naslednje postaje:</b> 2 minuti");*/
// spreminjanje lokacije
//busInfo.setLatLng([46.056129458185, 14.472137335197804]);


function sleep(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

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
                    /* neuporabna verzija za "sleep" ker freeza program
                    for(let j = 0; j < 1000; j++){
                        if (j == -1) {
                            break;
                        }
                        console.log(i);
                    }*/
                        //let test = new L.circle([data.results[0].trips[0].shape[i].lat, data.results[0].trips[0].shape[i].lng], {radius: 10}).addTo(map);

                        // moralo bi premikati avtobus, vendar sleep ne dela
                        busEx._latlng.lat = data.results[0].trips[0].shape[i].lat;
                        busEx._latlng.lng = data.results[0].trips[0].shape[i].lng;
                        //console.log(bus);
                }
            } )
        .catch(e => console.log(e))
}

const getBtn = document.getElementById('getBtn');

let schedule="<b>PRIHODI AVTOBUSOV</b><br><br>";
var bus;
function cur_bus()
{
    bus = document.getElementById('bus').value;
}
let markerList = [];
let stationID = 0;
const getData = () => fetch("https://api.ontime.si/api/v1/lpp/stops/?page_size=1367")
.then(response => response.json())
.then(data =>
    {
        layerGroup.clearLayers();
        layerGroupBikes.clearLayers();
        for (result in data.results)
        { 
            //var marker = new L.marker([data.results[result].lat,data.results[result].lng]).addTo(map)
            if (data.results[result].route_groups.includes(bus))
            {//console.log(data.results[result]);
                let marker = new L.marker([data.results[result].lat,data.results[result].lng]).on('click', markerOnClick).addTo(layerGroup)
                marker.bindTooltip(data.results[result].stop_id + "_" + data.results[result].name);
                markerList.push(marker);
            }
        }
        /*for(let i = 0; i < data.count;i++)
        {
            if (data.results[i].route_groups.includes("18") | data.results[i].route_groups.includes("14"))
           {
                var marker = new L.marker([data.results[i].lat,data.results[i].lng]).addTo(map)
            }
            
            //marker.bindPopup("<b>Hello world!</b><br>I am {name}",{name:data.results[i].name}).openPopup();
            ;
        }*/
    } )
.catch(e => console.log(e))

const getShape1 = () => fetch("https://api.ontime.si/api/v1/lpp/route-shapes/?groups="+bus)
.then(response => response.json())
.then(data =>
    {
        let data_len = data.results[0].trips[0].shape.length;
        let latlngs = [];
        for(let i = 0; i < data_len; i++)
        { 
            //var marker = new L.marker([data.results[result].lat,data.results[result].lng]).addTo(map)
            latlngs.push([data.results[0].trips[0].shape[i].lat, data.results[0].trips[0].shape[i].lng]);
            //data.results[0].trips[0].shape[i].lng
        }
        //console.log(latlngs);
        var polyline = L.polyline(latlngs, {color: 'red', opacity: 0.5}).addTo(layerGroup);
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
            //var marker = new L.marker([data.results[result].lat,data.results[result].lng]).addTo(map)
            latlngs.push([data.results[0].trips[1].shape[i].lat, data.results[0].trips[1].shape[i].lng]);
            //data.results[0].trips[0].shape[i].lng
        }
        //console.log(latlngs);
        var polyline = L.polyline(latlngs, {color: 'blue', opacity: 0.5}).addTo(layerGroup);
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
                if(data.timetable[timetable].group==bus){
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
        layerGroup.clearLayers();
        layerGroupBikes.clearLayers();
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
    }
)

getBtn.addEventListener('click', cur_bus);
getBtn.addEventListener('click', getData);
getBtn.addEventListener('click', getShape1);
getBtn.addEventListener('click', getShape2);
getBtnBicikelj.addEventListener('click', getBikes);

async function markerOnClick(e)
{
    stationID=e.target._tooltip._content.split("_")[0];
    getSchedule();
    console.log();
    if(schedule == "<b>PRIHODI AVTOBUSOV</b><br><br>")
    {
        await sleep(100);
        getSchedule();
    }
    e.target.bindPopup(schedule);
    schedule = "<b>PRIHODI AVTOBUSOV</b><br><br>"
    //console.log(stationID);
}