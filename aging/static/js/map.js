function addSlider(yearArray, groupOfLayers, map, currentLayer) {
    var slid = false;
    firstYear = yearArray[0];
    lastYear = yearArray[yearArray.length - 1];
    $("#firstyear").text(firstYear);
    $("#lastyear").text(lastYear);
    $("#mapslider").slider();

    $('#mapslider').on('slide', function(slideEvt) {
        slid = true;
        map.removeLayer(groupOfLayers[currentLayer]);
        year = slideEvt.value;
        // currentLayer = "FY" + yearFormatter(year);
        map.addLayer(groupOfLayers[year]);
    });
    // hacky workaround to handle bootstrap slider lack of change event.
    //
    $('#mapslider').on('slideStop', function(slideEvt) {
        if (slid === true) {
            slid = false;
        }
        else {
            map.removeLayer(groupOfLayers[currentLayer]);
            year = slideEvt.value;
            // currentLayer = "FY" + yearFormatter(year);
            map.addLayer(groupOfLayers[year]);
        }
    });
}

function map() {
  // Time slider
  // $("#slider").show();
  var geojson, info;
  var layerObj = {};
  var layerGroupList = [];
  var yearKey = {"percent15": 2015, "percent20":2020, "percent25": 2025};
  var yearVars = ["percent15", "percent20", "percent25"];
  var mapYears = [2015,2020,2025];
  var currentLayer = mapYears[0];

  function getColor(d) {
      return d > 0.2    ? '#F2E2E5' :
             d > 0.17   ? '#C1D0E3' :
             d > 0.15   ? '#7E9FC5' :
             d > 0.13   ? '#0C527F' :
             d > 0.1299 ? '#0A0F1C' :
                          '#787878';
  }

  function mapColor(feature) {
    var perOv65 = feature.properties.percentOver65;
    if (typeof perOv65 == 'undefined') {
        return "#787878";
    } else {
        return getColor(perOv65);
    }
  }

  function style(feature) {
      return {
          weight: 2,
          opacity: 1,
          color: 'white',
          dashArray: '3',
          fillOpacity: 0.9,
          fillColor: mapColor(feature)
      };
  }

  function highlightFeature(e) {
      var layer = e.target;

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
      layerObj[currentLayer].resetStyle(e.target);
      info.update();
  }

  function zoomToFeature(e) {
      map.fitBounds(e.target.getBounds());
  }

  function onEachFeature(feature, layer) {
      layer.on({
          mouseover: highlightFeature,
          mouseout: resetHighlight,
          click: zoomToFeature
      });
  }

  $.getJSON('static/data/towns.json', function(data) {

    var map = L.map('map').setView([41.562265, -72.690697], 9);

    var baselayer = L.tileLayer("http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
        attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
        subdomains: 'abcd',
        minZoom: 0,
        maxZoom: 20
    }).addTo(map);

    map.attributionControl.addAttribution('Population data &copy; <a href="http://census.gov/">US Census Bureau</a>');

    info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info');
        this.update();
        return this._div;
    };

    info.update = function (props) {
        this._div.innerHTML = '<h4>CT Population Over 65</h4>' +  (props ?
        '<b>' + props.name + '</b><br />' + props.percent15*100 + ' %'
                : 'Hover over a town');
    };

    info.addTo(map);

    var boundaries = data;

    yearVars.forEach(function(year) {
      boundaries.features.forEach(function(town) {
        var percent = town.properties[year];
        town.properties.percentOver65 = percent;
      });
      newLayer = L.geoJson(boundaries, {
        style: style,
        onEachFeature: onEachFeature
      });
      var y = yearKey[year];
      layerObj[y] = newLayer;
      layerGroupList.push(newLayer);
    });

    layerObj[currentLayer].addTo(map);

    // L.control.layers(layerObj).addTo(map);

    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
        // Since the getColor function is expecting numbers, not strings, I modified this array
                grades = [0.13,0.14,0.15,0.17,0.2]
                //grades = ["13%","14%","15%","17%","20%"],
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
    addSlider(mapYears,layerObj,map, currentLayer);
  })

}
