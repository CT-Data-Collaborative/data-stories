function map() {
  var map = L.map('map').setView([41.624265, -72.690697], 9);

  var Stamen_Toner = L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png', {
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: 'abcd',
      minZoom: 0,
      maxZoom: 20
  }).addTo(map);

  // var info = L.control();

  // info.onAdd = function (map) {
  //     this._div = L.DomUtil.create('div', 'info');
  //     this.update();
  //     return this._div;
  // };

  // info.update = function (props) {
  //     this._div.innerHTML = '<h4>CT Population Over 65</h4>' +  (props ?
  //     '<b>' + props.name + '</b><br />' + props.percent15*100 + ' %'
  //             : 'Hover over a town');
  // };

  // info.addTo(map);


  // // get color depending on population density value
  // function getColor(d) {
  //     return d > 0.2    ? '#F2E2E5' :
  //            d > 0.17   ? '#C1D0E3' :
  //            d > 0.15   ? '#7E9FC5' :
  //            d > 0.13   ? '#0C527F' :
  //            d > 0.1299 ? '#0A0F1C' :
  //                         '#787878';
  // }

  // function style(feature) {
  //     return {
  //         weight: 2,
  //         opacity: 1,
  //         color: 'white',
  //         dashArray: '3',
  //         fillOpacity: 0.9,
  //         fillColor: getColor(feature.properties.percent15)
  //     };
  // }

  // function highlightFeature(e) {
  //     var layer = e.target;

  //     layer.setStyle({
  //         weight: 5,
  //         color: '#666',
  //         dashArray: '',
  //         fillOpacity:1
  //     });

  //     if (!L.Browser.ie && !L.Browser.opera) {
  //         layer.bringToFront();
  //     }

  //     info.update(layer.feature.properties);
  // }

  // var geojson;

  // function resetHighlight(e) {
  //     geojson.resetStyle(e.target);
  //     info.update();
  // }

  // function zoomToFeature(e) {
  //     map.fitBounds(e.target.getBounds());
  // }

  // function onEachFeature(feature, layer) {
  //     layer.on({
  //         mouseover: highlightFeature,
  //         mouseout: resetHighlight,
  //         click: zoomToFeature
  //     });
  // }

  // geojson = L.geoJson(townShapes, {
  //     style: style,
  //     onEachFeature: onEachFeature
  // }).addTo(map);

  map.attributionControl.addAttribution('Population data &copy; <a href="http://census.gov/">US Census Bureau</a>');


  // var legend = L.control({position: 'bottomright'});

  // legend.onAdd = function (map) {

  //     var div = L.DomUtil.create('div', 'info legend'),
  //     // Since the getColor function is expecting numbers, not strings, I modified this array
  //             grades = [0.13,0.14,0.15,0.17,0.2]
  //             //grades = ["13%","14%","15%","17%","20%"],
  //             labels = [];

  //     for (var i = 0; i < grades.length; i++) {
  //         var from = grades[i];
  //         var to = grades[i + 1];
  //         // In order to have the percentages, you can just append it on to the string
  //         // Also, you can call getColor(from+1) b/c that would be asking for the color value of 1.x with x being the array
  //         // val from grades (e.g. 1.13). So instead might need to rework this to pass grades[i+1], grade[i+2] directly in order to get the
  //         // right values for the colors. Also, the way this is currently set up, the colors are getting inverted.
  //         labels.push(
  //                 '<i style="background:' + getColor(from) + '"></i> ' +
  //                 Math.round(from*100) + "%" + (Math.round(to*100) ? '&ndash;' + Math.round(to*100) + "%" : '+'));
  //     }

  //     div.innerHTML = labels.join('<br>');
  //     return div;
  // };

  // legend.addTo(map);
}
