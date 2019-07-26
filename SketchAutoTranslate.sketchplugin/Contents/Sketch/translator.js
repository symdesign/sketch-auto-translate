@import "common.js";

function Translator () {}

Translator.prototype.languageLabels = [
    'Afrikaans',
    'Arabic',
    'Armenian',
    'Azeerbaijani',
    'Belarusian',
    'Bosnian',
    'Bulgarian',
    'Catalan',
    'Chinese',
    'Croatian',
    'Czech',
    'Danish',
    'Dutch',
    'English',
    'Estonian',
    'Finnish',
    'French',
    'Georgian',
    'German',
    'Greek',
    'Hebrew',
    'Hungarian',
    'Italian',
    'Japanese',
    'Kazakh',
    'Latin',
    'Latvian',
    'Lithuanian',
    'Macedonian',
    'Norwegian',
    'Persian',
    'Polish',
    'Portuguese',
    'Romanian',
    'Russian',
    'Serbian',
    'Slovak',
    'Slovenian',
    'Spanish',
    'Swedish',
    'Turkish',
    'Ukrainian',
    'Vietnamese',
  ];
  
  
  Translator.prototype.languageCodes = [
    'af',
    'ar',
    'hy',
    'az',
    'be',
    'bs',
    'bg',
    'ca',
    'zh-CN',
    'hr',
    'cs',
    'da',
    'nl',
    'en',
    'et',
    'fi',
    'fr',
    'ka',
    'de',
    'el',
    'iw',
    'hu',
    'it',
    'ja',
    'kk',
    'la',
    'lv',
    'lt',
    'mk',
    'no',
    'fa',
    'pl',
    'pt',
    'ro',
    'ru',
    'sr',
    'sk',
    'sl',
    'es',
    'sv',
    'tr',
    'uk',
    'vi',
  ];
  


Translator.prototype.translateSelection = function (context) {

    var selection = context.selection;
    
    var title = selection.length == 0 ? 'Translate Current Page' : 'Translate Selection';

    if (selection.length == 0 ) {
        context.document.showMessage( 'Nothing selected. Switching to Page Translation.' );
    }

    var dialog = this.createWindow( context, title );

    var response = handleAlertResponse( dialog, dialog.runModal())
    var fromIndex = response[0];
    var toIndex = response[1];
    var constrain = response[2]

    var fromLanguage = this.languageCodes[fromIndex];
    var toLanguage = this.languageCodes[toIndex];

    if ( selection.length == 0 ) {
        selection = selectLayersOfTypeInContainer(context.document, "MSArtboardGroup", getCurrentPage(context) );
    }

    for ( var i = 0; i < selection.length; i++ ) {
        
        if ( isArtboard(selection[i]) ) {
            
            artboard = selection[i];
            ( sketchVersion > 45) ? artboard.select_byExpandingSelection(true, false) : artboard.select_byExtendingSelection(true, false);

            var symbolInstances = selectLayersOfTypeInContainer(context.document, "MSSymbolInstance", artboard);
            for ( var j = 0; j < symbolInstances.length; j++ ) {
                translateOverridesInSelection( symbolInstances[j], fromLanguage, toLanguage );
            }

            var textLayers = selectLayersOfTypeInContainer(context.document, "MSTextLayer", artboard);
            for ( var j = 0; j < textLayers.length; j++ ) {
                translateTextLayersInSelection( textLayers[j], fromLanguage, toLanguage )
            }

        }

        if ( isText(selection[i]) ) {
            translateTextLayersInSelection( selection[i], fromLanguage, toLanguage )
        }

        if ( isSymbol(selection[i]) ) {
            translateOverridesInSelection( selection[i], fromLanguage, toLanguage );
        }

    }

}


Translator.prototype.translatePage = function (context) {
    
    var doc         = context.document;
    var thisPage    = [doc currentPage];
    var artboards   = [thisPage artboards];
    
    var dialog = this.createWindow( context,'Translate Current Page' );

    var response = handleAlertResponse( dialog, dialog.runModal())
    var fromIndex = response[0];
    var toIndex = response[1];
    var constrain = response[2]

    var fromLanguage = this.languageCodes[fromIndex];
    var toLanguage = this.languageCodes[toIndex];
    var page       = getCurrentPage(context);

    if (artboards.length === 0) {
        doc.showMessage('There are no artboards which contain text.')
        return;
    }

    var artboards = selectLayersOfTypeInContainer(context.document, "MSArtboardGroup", page);
    for ( var i = 0; i < artboards.length; i++ ) {

        artboard = artboards[i];

        var sketchVersion = MSApplicationMetadata.metadata().appVersion;
        ( sketchVersion > 45) ? artboard.select_byExpandingSelection(true, false) : artboard.select_byExtendingSelection(true, false);

        var symbolInstances = selectLayersOfTypeInContainer(context.document, "MSSymbolInstance", artboard);
        for ( var j = 0; j < symbolInstances.length; j++ ) {
            translateOverridesInSelection( symbolInstances[j], fromLanguage, toLanguage );
        }

        var textLayers = selectLayersOfTypeInContainer(context.document, "MSTextLayer", artboard);
        for ( var j = 0; j < textLayers.length; j++ ) {
            translateTextLayersInSelection( textLayers[j], fromLanguage, toLanguage )
        }
    }
}

Translator.prototype.translateDocument = function (context) {

    var doc      = context.document;
    var pages    = [doc pages];

    var dialog    = this.createWindow( context, 'Translate Entire Document' );

    var response = handleAlertResponse( dialog, dialog.runModal())
    var fromIndex = response[0];
    var toIndex = response[1];
    var constrain = response[2]
    
    var fromLanguage = this.languageCodes[fromIndex];
    var toLanguage = this.languageCodes[toIndex];
    
    for ( var n = 0; n < pages.length; n++ ) {

        var thisPage  = pages[n];
        var artboards = [thisPage artboards];

        [doc setCurrentPage:thisPage];
        
        if (artboards.length === 0) {
            doc.showMessage('There are no artboards which contain text.')
            return;
        }

        var artboards = selectLayersOfTypeInContainer(context.document, "MSArtboardGroup", thisPage);
        
        for ( var i = 0; i < artboards.length; i++ ) {
    
            artboard = artboards[i];
    
            var sketchVersion = MSApplicationMetadata.metadata().appVersion;
            ( sketchVersion > 45) ? artboard.select_byExpandingSelection(true, false) : artboard.select_byExtendingSelection(true, false);
    
            var symbolInstances = selectLayersOfTypeInContainer(context.document, "MSSymbolInstance", artboard);
            for ( var j = 0; j < symbolInstances.length; j++ ) {
                translateOverridesInSelection( symbolInstances[j], fromLanguage, toLanguage );
            }
    
            var textLayers = selectLayersOfTypeInContainer(context.document, "MSTextLayer", artboard);
            for ( var j = 0; j < textLayers.length; j++ ) {
                translateTextLayersInSelection( textLayers[j], fromLanguage, toLanguage )
            }
        }

    }
    
}


Translator.prototype.createWindow = function(context, title) {

    var apiKey = getOption('apiKey', '');
    var title = title || 'Sketch Translate';

    if ( apiKey.length == 0 ) {

        this.openKeyWindow( context )

    } else {

        var dialogWindow = COSAlertWindow.new();

        var doc = context.document;
        var page = [doc currentPage];
        var layers = context.selection.length == 0 ? [page children] : context.selection;
        var excerpt = '';

        function recursiveLoop( layers ) {      
    
            for ( var i = 0; i < layers.length; i++ ) {
                var currentLayer = layers[i];
                if ( isArtboard(currentLayer) || isGroup(currentLayer) ) {
                    recursiveLoop( currentLayer.layers() )
                }
                if ( isText(currentLayer) ) {
                    if ( excerpt == '' ) excerpt = currentLayer.stringValue();
                    if ( currentLayer.stringValue().split(' ').length > 5 ) {
                        excerpt = currentLayer.stringValue();
                        return;
                    }
                }
            }
        }
    
        recursiveLoop( layers, '' );
        
        var fromLanguage = excerpt ? detectLanguage( excerpt ) : '';
        var fromLanguageSelect = createSelect( this.languageLabels );
        fromLanguageSelect.selectItemAtIndex( this.languageCodes.indexOf( fromLanguage ) )

        var toLanguage = String( getOption('toLanguage', 'en') );
        var toLanguageSelect = createSelect( this.languageLabels );
        toLanguageSelect.selectItemAtIndex( this.languageCodes.indexOf( toLanguage ) )

        dialogWindow.setMessageText(title);
        dialogWindow.setInformativeText('Please select origin and target language of your text translation.');

        dialogWindow.addAccessoryView( text( fontSizeLarge, 300, 10, 'From:')); // index 0
        dialogWindow.addAccessoryView(fromLanguageSelect); // index 1

        dialogWindow.addAccessoryView( text( fontSizeLarge, 300, 10, 'To:'));  // index 2
        dialogWindow.addAccessoryView(toLanguageSelect);  // index 3

        // In next version!
        // dialogWindow.addAccessoryView( checkbox( fontSizeLarge, 300, 24, 'Constrain Translation to Artboards', false ))

        dialogWindow.addAccessoryView( text( fontSizeLarge, 300, 8, '')); // Spacing
        
        dialogWindow.addButtonWithTitle('OK');
        dialogWindow.addButtonWithTitle('Cancel');

    }

    dialogWindow.setIcon(NSImage.alloc().initByReferencingFile(context.plugin.urlForResourceNamed("logo@2x.png").path()));
    return dialogWindow;
}


Translator.prototype.openKeyWindow = function(context) {
    var dialog   = this.createKeyWindow( context, 'Set Google API Key' );
    var response = handleKeyAlertResponse( dialog, dialog.runModal() );
}

Translator.prototype.createKeyWindow = function(context, title) {
    var apiKey = getOption('apiKey', '');
    var dialogWindow = COSAlertWindow.new();

    dialogWindow.setMessageText( title );
    dialogWindow.setInformativeText('Paste here your Google API Key:');
    dialogWindow.addTextFieldWithValue(apiKey.length == 0 ? '' : getOption('apiKey'));

    dialogWindow.addAccessoryView( text( fontSizeLarge, 300, 24, '\nNeed Help?') );

    dialogWindow.addAccessoryView( button( fontSizeSmall, 300, 20, 'Get a Google API Key', 'https://github.com/symdesign/sketch-auto-translate/wiki/Get-a-Google-API-key'));
    dialogWindow.addAccessoryView( text( fontSizeSmall, 300, 40, 'After one year of free usage, you will be charged by Google per translated character.\n'));

    dialogWindow.addAccessoryView( button( fontSizeSmall, 300, 20, 'Use without API key', 'https://github.com/symdesign/sketch-auto-translate/wiki/Use-without-API-Key'));
    dialogWindow.addAccessoryView( text( fontSizeSmall, 300, 40, 'No signup or recurring costs after a flat one-time payment.') );

    var apiKeyTextBox = dialogWindow.viewAtIndex(0);
    
    dialogWindow.alert().window().setInitialFirstResponder(apiKeyTextBox);
    
    dialogWindow.addButtonWithTitle('OK');
    dialogWindow.addButtonWithTitle('Cancel');
    
    dialogWindow.setIcon(NSImage.alloc().initByReferencingFile(context.plugin.urlForResourceNamed("logo@2x.png").path()));
    return dialogWindow;
}

