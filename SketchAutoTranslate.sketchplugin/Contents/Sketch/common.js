
var pluginIdentifier = "design.sym.sketch.translate";
var app              = NSApplication.sharedApplication();
var googleApiKey     = getOption('apiKey', '');
var sketchVersion    = MSApplicationMetadata.metadata().appVersion;

var promises        = [];

function isArtboard( selection ) {
    if ( [selection class] != MSArtboardGroup) return false;
    return true;
}

function isText( selection ) {
    if ([selection class] != MSTextLayer) return false;
    return true;
}

function isSymbol( selection ) {
    if ([selection class] != MSSymbolInstance) return false;
    return true;
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

function translateTextLayersInSelection( selection, toLanguage, doc ) {
    
    var text        = selection.stringValue(),
    baseLanguage    = detectLenguage( text );
    
    if ( baseLanguage == 'und' ) return;
    log(getSingleTranslation( text, baseLanguage, toLanguage))
    selection.setStringValue( getSingleTranslation( text, baseLanguage, toLanguage) );
    return selection
}

function translateOverridesInSelection( selection, toLanguage ) {
    
    var overrides = selection.overrides(),
    text = ''
    
    for ( a in overrides ) {
        // Loop through 2 levels of overrides
        if ( typeof overrides[a].property === 'undefined' ) { text += ' ' + overrides[a] } 
        else { for ( b in overrides[a] ) { text += ' ' + overrides[a][b] } }
    }
    var translation = {},
    baseLanguage    = detectLenguage( text );
    
    if ( baseLanguage == 'und' ) return;
    
    for ( a in overrides ) {
        if ( typeof overrides[a].property === 'undefined' ) {
            translation[a] = getSingleTranslation( overrides[a], baseLanguage, toLanguage );
        } else {
            translation[a] = translateOverrides( overrides[a], baseLanguage, toLanguage )
        }
        
        selection.overrides = translation
        return selection;
    }
}

function translateOverrides( overrides, baseLanguage, toLanguage ) {
    var translation = {};
    for ( a in overrides ) {
        if ( typeof overrides[a].property === 'undefined' ) {
            translation[a] = getSingleTranslation(overrides[a], baseLanguage, toLanguage);
        } else {
            translation[a] = translateOverrides( overrides[a], baseLanguage, toLanguage )
        }
        return translation;
    }
}

function handleAlertResponse(dialog, responseCode) {
    if (responseCode == "1000") {
        return dialog.viewAtIndex(0).indexOfSelectedItem();
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

function detectLenguage( text ) {
    var escapedText = text.replace('"', '\"');
    var data = JSON.stringify({q:escapedText});
    
    var languageDetected = networkRequest(["-X", "POST", "https://translation.googleapis.com/language/translate/v2/detect?key=" + googleApiKey, "-H", "Content-Type: application/json; charset=utf-8", "-d", data]);
    
    return languageDetected.data.detections[0][0].language;
}


function getSingleTranslation( text, baseLanguage, toLanguage) {

    var escapedText = text.replace('"', '\"');
    var data = JSON.stringify({q:escapedText, source: baseLanguage, target: toLanguage});
    if (baseLanguage == toLanguage) return text;

    var singleTranslation = networkRequest(["-X", "POST", "https://translation.googleapis.com/language/translate/v2?key=" + googleApiKey, "-H", "Content-Type: application/json; charset=utf-8", "-d", data]);

    log( text + ' 👉 ' + singleTranslation.data.translations[0].translatedText )
    return decodeHtmlEntity(singleTranslation.data.translations[0].translatedText);
}   

var decodeHtmlEntity = function(str) {
    
    str = str.replace(/&#(\d+);/g, function(match, dec) {
        return String.fromCharCode(dec);
    });
    
    str = str.replace('&lt;','<')
    .replace('&gt;','>')
    
    return str
};

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