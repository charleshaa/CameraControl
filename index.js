const path = require( 'path' );
const fs = require( 'fs' );
const bodyParser = require( 'body-parser' );
const net = require( 'net' );
const express = require( 'express' );
const app = express();

app.set( 'port', ( process.env.PORT || 3001 ) );
app.use( express.static( path.join( __dirname, 'public' ) ) );
app.use( bodyParser.urlencoded() );
app.use( bodyParser.json() );


/**
 * Prints out to console in a readable format
 * @param  {Any} msg                What to log
 * @param  {String} [type="log"]    Warning/Info/Error
 * @return {undefined}
 */
const pprint = ( msg, type = "log" ) => {
    console[ type ]( "\r\n----------\r\n" );
    console[ type ]( msg );
    console[ type ]( "\r\n----------\r\n" );
};

// Home

app.get( '/', function ( req, res ) {
    res.sendFile( path.join( __dirname + '/index.html' ) );
} );

// Camera control endpoin - not used yet

app.get( '/control', function ( req, res ) {

    var action = 'Shoot\r\n';

	var host 		= '0.tcp.ngrok.io';
	var sockPort 	= parseInt(req.query.port) || 0;

    sock = new net.Socket();

    sock.connect( sockPort, host, function ( result ) {
        pprint( result, "info" );
        console.log( "Connected to PC program" );
    } );

    sock.on( 'error', function ( ex ) {
        pprint(ex, "error");
    } );

    if ( req.query.action ) {
        switch ( req.query.action ) {
            case "con":
                action = "Connect\r\n";
                break;
            case "disc":
                action = "Disconnect\r\n";
                break;
            case "lv":
                action = "LV - Toggle\r\n";
                break;
            case "af":
                action = "AF\r\n";
                break;
            case "afs":
                action = "AF Shoot\r\n";
                break;
            default:
                action = "Shoot\r\n";
                break;
        }
    }

    sock.write( action, 'ascii' );

    // Kill socket to prevent program freeze
    setTimeout( function () {
        sock.destroy();
    }, 2000 );

    res.json( {
        success: true,
        action: action.trim()
    } );
} );

app.listen( app.get( 'port' ), function () {
    console.log( 'App listening on port ' + app.get( 'port' ) )
} );
