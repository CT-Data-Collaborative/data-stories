function map() {
  // Time slider
  // $("#slider").show();
  var geojson, info;
  var layerObj = {};
  var yearKey = {"percent15": 2015, "percent20":2020, "percent25": 2025};
  var layerKey = {2015: "percent15", 2020: "percent20", 2025:"percent25"}
  var yearVars = ["percent15", "percent20", "percent25"];
  var mapYears = [2015,2020,2025];
  var currentLayer = mapYears[0];

  function addSlider(yearArray, groupOfLayers, map) {
    var slid = false;
    firstYear = yearArray[0];
    lastYear = yearArray[yearArray.length - 1];
    $("#firstyear").text(firstYear);
    $("#lastyear").text(lastYear);
    $("#mapslider").slider();

    $('#mapslider').on('change', function(slideEvt) {
        map.removeLayer(groupOfLayers[currentLayer]);
        year = slideEvt.value;
        // console.log(year);
        currentLayer = year.newValue;
        map.addLayer(groupOfLayers[currentLayer]);
    });
  }

  function getColor(d) {
      return d > 0.2    ? '#F2E2E5' :
             d > 0.17   ? '#C1D0E3' :
             d > 0.15   ? '#7E9FC5' :
             d > 0.13   ? '#0C527F' :
                          '#0A0F1C';
  }

  function mapColor(feature) {
    var k = layerKey[currentLayer]
    var perOv65 = feature.properties[k];
    if (typeof perOv65 == 'undefined') {
        return "#787878";
    } else {
        return getColor(perOv65);
    }
  }

  function style(feature) {
    console.log(currentLayer);
      return {
          weight: 2,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.9,
          fillColor: mapColor(feature)
      };
  }

    info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };

    info.update = function (props) {
        this._div.innerHTML = '<h4>CT Population Over 65</h4>' +  (props ?
        '<b>' + props.name + '</b><br />' + props.percentOver65*100 + ' %'
                : 'Hover over a town');
    };

  function highlightFeature(e) {
      var layer = e.target;
      // console.log(layer);
      layer.setStyle({
          weight: 5,
          color: '#666',
          dashArray: '',
          fillOpacity:1
      });

      if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
      }

      info.update(layer.feature.properties);
  }

  function resetHighlight(e) {
    console.log(e);
    layerObj[currentLayer].resetStyle(e.target);
    info.update();
  }

  function onEachFeature(feature, layer) {
      layer.on({
          mouseover: highlightFeature,
          mouseout: resetHighlight,
      });
  }

  $.getJSON('static/data/towns.json', function(data) {

    var boundaries = data;

    var map = L.map('map').setView([41.562265, -72.690697], 9);

    var baselayer = L.tileLayer("http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 20
    }).addTo(map);

    map.attributionControl.addAttribution('Population data &copy; <a href="http://census.gov/">US Census Bureau</a>');






    yearVars.forEach(function(year) {
      boundaries.features.forEach(function(town) {
        var percent = town.properties[year];
        town.properties.percentOver65 = percent;
      });
      var newLayer = L.geoJson(boundaries, {
        style: style,
        onEachFeature: onEachFeature
      });
      var y = yearKey[year];
      layerObj[y] = newLayer;
    });

    // console.log(layerObj);
    layerObj[currentLayer].addTo(map);
    info.addTo(map);
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
        // Since the getColor function is expecting numbers, not strings, I modified this array
                grades = [0.2,0.17,0.15,0.14,0.13]
                labels = [];

        for (var i = 0; i < grades.length; i++) {
            var from = grades[i];
            var to = grades[i + 1];
            // In order to have the percentages, you can just append it on to the string
            // Also, you can call getColor(from+1) b/c that would be asking for the color value of 1.x with x being the array
            // val from grades (e.g. 1.13). So instead might need to rework this to pass grades[i+1], grade[i+2] directly in order to get the
            // right values for the colors. Also, the way this is currently set up, the colors are getting inverted.
            labels.push(
                    '<i style="background:' + getColor(from) + '"></i> ' +
                    Math.round(from*100) + "%" + (Math.round(to*100) ? '&ndash;' + Math.round(to*100) + "%" : '+'));
        }

        div.innerHTML = labels.join('<br>');
        return div;
    };

    legend.addTo(map);
    addSlider(mapYears,layerObj,map);
  })

}
