
var pluginIdentifier = "design.sym.sketch.translate";
var app              = NSApplication.sharedApplication();
var googleApiKey     = getOption('apiKey', '');
var sketchVersion    = MSApplicationMetadata.metadata().appVersion;

var fontSizeLarge = 13
var fontSizeSmall = 11;


function text( fontSize, width, height, string ) {
    
    var text = NSTextView.alloc().initWithFrame(NSMakeRect(0, 0, width, height));
    text.setFont(NSFont.systemFontOfSize( fontSize ));
    text.setString( string );
    text.setEditable(false);
    text.setSelectable(false);
    text.setDrawsBackground(false);

    return text;
}

function button( fontSize, width, height, str,  url ) {
    
    var href = url;
    var button = NSButton.alloc().initWithFrame( NSMakeRect(0, 0, width, height) );
    button.setTitle( str );
    button.setFont(NSFont.systemFontOfSize( fontSize ));
    button.setBezelStyle(NSBezelStyleTexturedRounded);
    button.setCOSJSTargetFunction(function() {

        var url = NSURL.URLWithString( href );
        if (!NSWorkspace.sharedWorkspace().openURL( url )) {
            log( @"Failed to open url:" + url.description() );
        }

    });

    return button;
}

function checkbox( fontSize, width, height, str, checked ) {

    var checkbox = NSButton.alloc().initWithFrame( NSMakeRect(0, 0, width, height) )
    checkbox.setButtonType( NSSwitchButton );
    checkbox.setBezelStyle( 0 );
    checkbox.setTitle( str );
    checkbox.setFont( NSFont.systemFontOfSize( fontSize ) );
    checkbox.setState( checked ? NSOnState : NSOffState ); // or NSOnState

    return checkbox;
}

function isArtboard( selection ) {
    return selection instanceof MSArtboardGroup;
}

function isText( selection ) {
    return selection instanceof MSTextLayer;
}

function isGroup( selection ) {
    return selection instanceof MSLayerGroup;
}

function isSymbol( selection ) {
    return selection instanceof MSSymbolInstance;
}

function getCurrentPage( context ) {
    var doc = context.document;
    var page = [doc currentPage];
    
    return page;
}

function selectLayersOfTypeInContainer(doc, layerType, containerLayer) {
    var scope = (typeof containerLayer !== 'undefined') ? [containerLayer children] : [[doc currentPage] children];
    var predicate = NSPredicate.predicateWithFormat("(className == %@)", layerType);
    var layers = [scope filteredArrayUsingPredicate:predicate];
    var page = (layerType === 'MSArtboardGroup') ? containerLayer : [doc currentPage];
    
    page.deselectAllLayers ? page.deselectAllLayers() : page.changeSelectionBySelectingLayers_([]);
    
    var loop = [layers objectEnumerator],
    layer, layers = [];
    
    while (layer = [loop nextObject]) {
        layers.push(layer);
        ( sketchVersion > 45) ? layer.select_byExpandingSelection(true, false) : layer.select_byExtendingSelection(true, false);
    }
    
    return layers;
}

function translateTextLayersInSelection( selection, fromLanguage, toLanguage, doc ) {
    if ( fromLanguage != 'und' ) selection.setStringValue( getSingleTranslation( selection.stringValue(), fromLanguage, toLanguage) );
    return selection
}

function translateOverridesInSelection( selection, fromLanguage, toLanguage ) {
    
    if ( fromLanguage == 'und' ) return;

    var overrides = selection.overrides();
    
    for ( a in overrides ) {
        // Loop through 2 levels of overrides
        if ( typeof overrides[a].property === 'undefined' ) { text += ' ' + overrides[a] } 
        else { for ( b in overrides[a] ) { text += ' ' + overrides[a][b] } }
    }
    var translation = {};
    
    for ( a in overrides ) {
        if ( typeof overrides[a].property === 'undefined' ) {
            translation[a] = getSingleTranslation( overrides[a], fromLanguage, toLanguage );
        } else {
            translation[a] = translateOverrides( overrides[a], fromLanguage, toLanguage )
        }
        
        selection.overrides = translation
        return selection;
    }
}

function translateOverrides( overrides, fromLanguage, toLanguage ) {
    var translation = {};
    for ( a in overrides ) {
        if ( typeof overrides[a].property === 'undefined' ) {
            translation[a] = getSingleTranslation(overrides[a], fromLanguage, toLanguage);
        } else {
            translation[a] = translateOverrides( overrides[a], fromLanguage, toLanguage )
        }
        return translation;
    }
}

function handleAlertResponse(dialog, responseCode) {
    if (responseCode == "1000") {

        // Title
        // InformativeText
        // 0 = Label
        // 1 = Selection
        // 2 = Label
        // 3 = Selection
        // 4 = Constrain to Artboards

        return [
            dialog.viewAtIndex(1).indexOfSelectedItem(),
            dialog.viewAtIndex(3).indexOfSelectedItem(),
            0 /* In next version! dialog.viewAtIndex(4).indexOfSelectedItem() */
        ]
    } else {
        return null;
    }
}

function handleKeyAlertResponse(dialog, responseCode) {
    if (responseCode == "1000") {
        var apiKeyValue = dialog.viewAtIndex(0).stringValue();
        
        setPreferences('apiKey', apiKeyValue );
        
        return true;
    } else {
        return false;
    }
}

function createSelect(options) {
    var select = NSPopUpButton.alloc().initWithFrame(NSMakeRect(0, 0, 200, 28));
    
    select.addItemsWithTitles(options);
    select.selectItemAtIndex(0);
    
    return select;
}

function detectLanguage( text ) {
    var escapedText = text.replace('"', '\"');
    var data = JSON.stringify({q:escapedText});
    
    var languageDetected = networkRequest(["-X", "POST", "https://translation.googleapis.com/language/translate/v2/detect?key=" + googleApiKey, "-H", "Content-Type: application/json; charset=utf-8", "-d", data]);
    
    return languageDetected.data.detections[0][0].language;
}


function getSingleTranslation( text, fromLanguage, toLanguage) {

    setPreferences('toLanguage', toLanguage );

    var escapedText = text.replace('"', '\"');
    var data = JSON.stringify({q:escapedText, source: fromLanguage, target: toLanguage});
    if (fromLanguage == toLanguage) return text;

    var singleTranslation = networkRequest(["-X", "POST", "https://translation.googleapis.com/language/translate/v2?key=" + googleApiKey, "-H", "Content-Type: application/json; charset=utf-8", "-d", data]);
    return decodeHtmlEntity(singleTranslation.data.translations[0].translatedText);
}   


function networkRequest( args ) {
    var task = NSTask.alloc().init();
    task.setLaunchPath("/usr/bin/curl");
    task.setArguments(args);
    
    var outputPipe = [NSPipe pipe];
    [task setStandardOutput:outputPipe];
    task.launch();
    
    var responseData = [[outputPipe fileHandleForReading] readDataToEndOfFile];
    var responseString = [[[NSString alloc] initWithData:responseData encoding:NSUTF8StringEncoding]];
    var parsed = tryParseJSON(responseString);
    
    if (!parsed) {
        log("Error invoking curl");
        log("args:");
        log(args);
        log("responseString");
        log(responseString);
        throw "Error communicating with server";
    }
    
    return parsed;
}

function tryParseJSON( jsonString ){
    try {
        var o = JSON.parse(jsonString);
        
        if (o && typeof o === "object" && o !== null) {
            return o;
        }
    }
    catch (e) { }
    
    return false;
}


function getOption( key, defaultValue ) {
    return getPreferences( key, defaultValue );
}

function getPreferences( key, defaultValue ) {
    var userDefaults = NSUserDefaults.standardUserDefaults();
    
    if (!userDefaults.dictionaryForKey(pluginIdentifier)) {
        var defaultPreferences = NSMutableDictionary.alloc().init();
        
        userDefaults.setObject_forKey(defaultPreferences, pluginIdentifier);
        userDefaults.synchronize();
    }
    
    var value = userDefaults.dictionaryForKey(pluginIdentifier).objectForKey( key);
    
    return (value === null) ? defaultValue : value;
}

function setPreferences( key, value ) {
    var userDefaults = NSUserDefaults.standardUserDefaults();
    var preferences;
    
    if (!userDefaults.dictionaryForKey(pluginIdentifier)) {
        preferences = NSMutableDictionary.alloc().init();
    } else {
        preferences = NSMutableDictionary.dictionaryWithDictionary(userDefaults.dictionaryForKey(pluginIdentifier));
    }
    
    preferences.setObject_forKey(value, key);
    
    userDefaults.setObject_forKey(preferences, pluginIdentifier);
    userDefaults.synchronize();
}

function setInterval(fn, time_ms) {
    coscript.setShouldKeepAround(true);
    var time_sec = time_ms / 1000;
    coscript.scheduleWithRepeatingInterval_jsFunction(time_sec, fn);
}

function clearInterval(interval) {
    coscript.setShouldKeepAround(false);
    interval.cancel();
}

function setTimeout(fn, time_ms) {
    coscript.setShouldKeepAround(true);
    var time_sec = time_ms / 1000;
    coscript.scheduleWithInterval_jsFunction(time_sec,fn);
}

function loop(count, callback, done) {
    var counter = 0, speed = 500; // in ms
    var next = function () {
        setTimeout(iteration, speed);
    };
    var iteration = function () {
        counter < count ? callback(counter, next) : ( done && done() )
        counter++;
    }
    iteration();
}


  
function decodeHtmlEntity(str) {
    
    var entities = {
        'amp': '&',
        'apos': '\'',
        '#x27': '\'',
        '#x2F': '/',
        '#39': '\'',
        '#47': '/',
        'lt': '<',
        'gt': '>',
        'nbsp': ' ',
        'quot': '"'
    }

    str = str.replace(/&#(\d+);/g, function(match, dec) {
        return String.fromCharCode(dec);
    });
    
    for ( var key in entities) {

        str = str.replace( '&' + key + ';', entities[ key ] )

    }

    return str
};