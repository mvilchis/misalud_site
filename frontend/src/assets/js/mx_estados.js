// Width and height
          var w = 700;
          var h = 400;
          //define projection
          var projection      =   d3.geoAlbers().translate([ 0,0 ]);
          //define path generator
          var path            =   d3.geoPath( projection );
          //svg
          var svg = d3.select("#mapa")
                    .append("svg")
                    .attr("width", w)
                    .attr("height", h);
          //load GeoJson data
          d3.json("mx_estados.json").then( function(data) {
            // bind data
            svg.selectAll('path')
		.data(data)
		.enter()
		.append('path')
		.attr('d','path')
        });





/*
var color           =   d3.scaleQuantize().range([
    'rgb(255,245,240)', 'rgb(254,224,210)', 'rgb(252,187,161)',
    'rgb(252,146,114)', 'rgb(251,106,74)', 'rgb(239,59,44)',
    'rgb(203,24,29)', 'rgb(165,15,21)', 'rgb(103,0,13)'
]);

// Projection
var projection      =   d3.geoAlbersUsa()
    .translate([ 0,0 ]);
var path            =   d3.geoPath( projection );
    // .projection( projection );

// Create SVG
var svg             =   d3.select("#mapa")
    .append("svg")
    .attr("width", chart_width)
    .attr("height", chart_height);

var zoom_map        =   d3.zoom()
    .scaleExtent([ 0.5, 3.0 ])
    .translateExtent([
        [ -1000, -500 ],
        [ 1000, 500 ]
    ])
    .on( 'zoom', function(){
    // console.log( d3.event );
    var offset      =   [
        d3.event.transform.x,
        d3.event.transform.y
    ];
    var scale       =   d3.event.transform.k * 2000;

    projection.translate( offset )
        .scale( scale );

    svg.selectAll( 'path' )
        .transition()
        .attr( 'd', path );
});

var map             =   svg.append( 'g' )
    .attr( 'id', 'map' )
    .call( zoom_map )
    .call(
        zoom_map.transform,
        d3.zoomIdentity
            .translate( chart_width / 2, chart_height / 2 )
            .scale( 1 )
    );

map.append( 'rect' )
    .attr( 'x', 0 )
    .attr( 'y', 0 )
    .attr( 'width', chart_width )
    .attr( 'height', chart_height )
    .attr( 'opacity', 0 );

// Data
d3.json( 'mx_estados.json', function( data ){
        svg.selectAll('path')
		.data(data)
		.enter()
		.append('path')
		.attr('d','path')
        });

        // console.log(us_data);

        map.selectAll( 'path' )
            .data( us_data.features )
            .enter()
            .append( 'path' )
            .attr( 'd', path )
            .attr( 'fill', function( d ){
                var num         =   d.properties.num;
                return num ? color( num ) : '#ddd';
            })
            .attr( 'stroke', '#fff' )
            .attr( 'stroke-width', 1 );
*/

        
 
