$.getJSON("static/data/troops_with_stops.geojson", function(data1) {
  $.getJSON("static/data/towns_with_stops.geojson", function(data) {
          // Define pattern for municipalities with no department

          var stripes = new L.StripePattern(
            {
              weight: 1,
              angle: -45,
              spaceWeight: 1
            });


          // Interactions

          function highlightFeature(e) {
            var layer = e.target;
            layer.setStyle({
                    weight: 5,
                    color: '#666',
                    dashArray: '',
                    fillOpacity: 0.7
                });

            if (!L.Browser.ie && !L.Browser.opera) {
                layer.bringToFront();
            }
            info.update(layer.feature.properties);
            }

          function townResetHighlight(e) {
              townJSON.resetStyle(e.target);
              info.update();
          }

          function troopsResetHighlight(e) {
              troopsJSON.resetStyle(e.target);
              info.update();
          }

          function townOnEachFeature(feature, layer) {
              layer.on({
                  mouseover: highlightFeature,
                  mouseout: townResetHighlight
              });
          }

          function troopsOnEachFeature(feature, layer) {
              layer.on({
                  mouseover: highlightFeature,
                  mouseout: troopsResetHighlight
              });
          }


          // Set up breakpoints for Troops
          troopStopsCounts = data1.features.map(function(t) {
            return +t.properties.Stops;
          });

          troopBreaks = ss.jenks(troopStopsCounts, 3);


          function getTroopColor(d) {
            return d > troopBreaks[3] ? '#016c59' :
                   d > troopBreaks[2] ? '#1c9099' :
                   d > troopBreaks[1] ? '#67a9cf' :
                   d > troopBreaks[0] ? '#bdc9e1' :
                                   '#f6eff7';
          }

          function troopStyle(feature) {
            styleObj = {
              opacity: 1,
              weight: 1,
              color: '#464646',
              fillOpacity: 1,
              fillColor: getTroopColor(feature.properties.Stops)
            };
            return styleObj;
          }



          // Set up breakpoints for Towns
          stopsCount = data.features.map(function(t) {
            return +t.properties.Stops
          });

          stopsCount = stopsCount.filter(function(e) { return e});

          breaks = ss.jenks(stopsCount,3);

          function getColor(d) {
            return d > breaks[3] ? '#016c59' :
                   d > breaks[2] ? '#1c9099' :
                   d > breaks[1] ? '#67a9cf' :
                   d > breaks[0] ? '#bdc9e1' :
                                   '#f6eff7';
          }

          function style(feature) {
            styleObj = {
              opacity: 1,
              weight: 1,
              color: '#464646',
              fillOpacity: 1,
            };
            if (+feature.properties.Stops == 0) {
              styleObj['fillPattern'] = stripes;
              styleObj['weight'] = 0;
            } else {
              styleObj['fillColor'] = getColor(feature.properties.Stops);
            }
            return styleObj;
          }


          townJSON = L.geoJson(data, {style: style, onEachFeature: townOnEachFeature});
          troopsJSON = L.geoJson(data1, {style: troopStyle, onEachFeature: troopsOnEachFeature});

          var layers = {
            'Municipal Departments': townJSON,
            'State Police Troops': troopsJSON
          };

          var tileLayer = new L.tileLayer("http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
              attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
            });
          var map = new L.map('townmap', {zoomControl: false}).setView([41.5013,-72.8325],8);
          stripes.addTo(map);
          tileLayer.addTo(map);
          townJSON.addTo(map);
          L.control.layers(layers).addTo(map);
          map.on('baselayerchange', function (eventLayer) {
            console.log(eventLayer);
            if (eventLayer.name == 'Municipal Departments') {
              this.removeControl(troopLegend);
              townLegend.addTo(map);
            } else {
              this.removeControl(townLegend)
              troopLegend.addTo(map);
            }
          });
          var info = L.control({position: 'topleft'});
          info.onAdd = function (map) {
              this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
              this.update();
              return this._div;
          };

          // method that we will use to update the control based on feature properties passed
          info.update = function (props) {
              this._div.innerHTML = '<h4>Department</h4>' +  (props ?
                  '<b>' + props.Name + '</b><br />' + (+props.Stops).toLocaleString()
                  : 'Hover over a department');
          };
          info.addTo(map);

          var townLegend = L.control({position: 'bottomright'});

          townLegend.onAdd = function (map) {

              var div = L.DomUtil.create('div', 'info legend'),
                  grades = [0]
                  grades = grades.concat(breaks.slice(0,3));

                  labels = [];
              div.innerHTML += '# of Stops<br>';
              // loop through our density intervals and generate a label with a colored square for each interval
              for (var i = 0; i < grades.length; i++) {
                  div.innerHTML +=
                      '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                      grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
              }

              return div;
          };

          townLegend.addTo(map);

          var troopLegend = L.control({position: 'bottomright'});

          troopLegend.onAdd = function (map) {

              var div = L.DomUtil.create('div', 'info legend'),
                  grades = [0]
                  grades = grades.concat(troopBreaks.slice(0,3));

                  labels = [];
              div.innerHTML += '# of Stops<br>';
              // loop through our density intervals and generate a label with a colored square for each interval
              for (var i = 0; i < grades.length; i++) {
                  div.innerHTML +=
                      '<i style="background:' + getTroopColor(grades[i] + 1) + '"></i> ' +
                      grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
              }

              return div;
          };




        });
})
