function map() {
  var geojson, info, stateLayer;
  var layerObj = {};
  var layerKey = {2015: "percent15", 2020: "percent20", 2025:"percent25"}
  var mapYears = [2015,2020,2025];
  var currentLayer = mapYears[0];

  function addSlider(yearArray) {
    firstYear = yearArray[0];
    lastYear = yearArray[yearArray.length - 1];
    $("#firstyear").text(firstYear);
    $("#lastyear").text(lastYear);
    $("#mapslider").slider();
    $('#mapslider').on('change', function(slideEvt) {
        year = slideEvt.value;
        currentLayer = year.newValue;
        setVariable(year.newValue);
    });
  }

  // function getColor(d) {
  //     return d > 0.2    ? '#F2E2E5' :
  //            d > 0.17   ? '#C1D0E3' :
  //            d > 0.15   ? '#7E9FC5' :
  //            d > 0.13   ? '#0C527F' :
  //                         '#0A0F1C';
  // }

  function getColor(d) {
      return d > 0.2    ? '#0A0F1C' :
             d > 0.17   ? '#0C527F' :
             d > 0.15   ? '#7E9FC5' :
             d > 0.13   ? '#C1D0E3' :
                          '#F2E2E5';
  }
  function mapColor(layer, variableName) {
    var perOv65 = layer.feature.properties[variableName];
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

  info = L.control();

  info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info');
      this.update();
      return this._div;
  };

  info.update = function (props) {
      key = layerKey[currentLayer];
      this._div.innerHTML = '<h4>CT Population Over 65</h4>' +  (props ?
      '<b>' + props.name + '</b><br />' + props[key]*100 + ' %'
              : 'Hover over a town');
  };

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
    var layer = e.target;
    layer.setStyle({
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.9
    });
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

    // set variable for first layer
    boundaries.features.forEach(function(town) {
        town.properties.percentOver65 = town.properties.percent15;;
      });

    stateLayer = L.geoJson(boundaries, {
      onEachFeature: onEachFeature
    }).addTo(map);

    info.addTo(map);
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
        // Since the getColor function is expecting numbers, not strings, I modified this array
                grades = [0, 0.131, 0.151, 0.171, 0.201]
                labels = [];

        for (var i = 0; i < grades.length; i++) {
            var from = grades[i];
            var to = grades[i + 1];
            labels.push(
                    '<i style="background:' + getColor(from) + '"></i> ' +
                    Math.round(from*100) + "%" + (Math.round(to*100) ? '&ndash;' + Math.round(to*100) + "%" : '+'));
        }

        div.innerHTML = labels.join('<br>');
        return div;
    };

    legend.addTo(map);
    addSlider(mapYears);
    setVariable(mapYears[0]);
  })

// This is not setting a JavaScript
// variable, but rather the variable by which the map is colored.
// The input is a string 'currentYear', which specifies which property
// of the  geoJSON file is used to color the map.
  function setVariable(currentYear) {
    variableName = layerKey[currentYear];
    stateLayer.eachLayer(function(layer) {
      layer.setStyle({
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.9,
        fillColor: mapColor(layer, variableName)
      })
    })
  }
}
