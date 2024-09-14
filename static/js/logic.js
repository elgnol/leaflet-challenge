let myMap = L.map("map", {
    center: [39.50, -98.35],
    zoom: 5
  });
  
// Adding the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);

let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

d3.json(url).then(function(response) {

    console.log(response);
    let features = response.features;
    function getColor(depth) {
        let colorScale = d3.scaleLinear()
                    .domain([-10, 90])  // Define the range of depths
                    .range(["green", "red"]);  // Color scale from green (low) to red (high)

        return colorScale(depth);
    }
    features.forEach(function(feature) {
        let location = feature.geometry;
        if (location) {
            let coords = [location.coordinates[1], location.coordinates[0]];
            let depth = location.coordinates[2];
            let magnitude = feature.properties.mag;
            let place = feature.properties.place;
            let time = new Date(feature.properties.time);
            
            let popupContent = `<strong>Location:</strong> ${place}<br>
                                <strong>Magnitude:</strong> ${magnitude}<br>
                                <strong>Depth:</strong> ${depth} km<br>
                                <strong>Time:</strong> ${time.toLocaleString()}`;
            
            L.circle(coords, {
                fillOpacity: 0.75,
                color: "white",
                fillColor: getColor(depth),
                radius: magnitude * 20000 // Adjust radius as needed
            }).bindPopup(popupContent).addTo(myMap);
        }
    
    });

    function createLegend() {
        let legend = L.control({position: 'bottomright'});

        legend.onAdd = function () {
            let div = L.DomUtil.create('div', 'legend');
            let depthRanges = [
                { range: '-10-10', color: getColor(5) },
                { range: '10-30', color: getColor(20) },
                { range: '30-50', color: getColor(40) },
                { range: '50-70', color: getColor(60) },
                { range: '70-90', color: getColor(80) },
                { range: '90+', color: getColor(90) }
            ];

            div.innerHTML = '<h4>Legend</h4>';

            depthRanges.forEach(function(item) {
                div.innerHTML +=
                    '<i style="background:' + item.color + '"></i> ' +
                    item.range + '<br>';
            });

            return div;
        };

        legend.addTo(myMap);
    }

    createLegend();
});