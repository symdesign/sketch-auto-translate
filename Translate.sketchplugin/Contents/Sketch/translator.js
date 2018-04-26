@import "common.js";

function Translator () {}

Translator.prototype.languageLabels = [
    'English',
    'German',
    'Norwegian',
    '',
    'Afrikaans',
    'Albanian',
    'Amharic',
    'Arabic',
    'Armenian',
    'Azeerbaijani',
    'Basque',
    'Belarusian',
    'Bengali',
    'Bosnian',
    'Bulgarian',
    'Catalan',
    'Cebuano',
    'Chinese (Simplified)',
    'Chinese (Traditional)',
    'Corsican',
    'Croatian',
    'Czech',
    'Danish',
    'Dutch',
    'Esperanto',
    'Estonian',
    'Finnish',
    'French',
    'Frisian',
    'Galician',
    'Georgian',
    'Greek',
    'Gujarati',
    'Haitian Creole',
    'Hausa',
    'Hawaiian',
    'Hebrew',
    'Hindi',
    'Hmong',
    'Hungarian',
    'Icelandic',
    'Igbo',
    'Indonesian',
    'Irish',
    'Italian',
    'Japanese',
    'Javanese',
    'Kannada',
    'Kazakh',
    'Khmer',
    'Korean',
    'Kurdish',
    'Kyrgyz',
    'Lao',
    'Latin',
    'Latvian',
    'Lithuanian',
    'Luxembourgish',
    'Macedonian',
    'Malagasy',
    'Malay',
    'Malayalam',
    'Maltese',
    'Maori',
    'Marathi',
    'Mongolian',
    'Myanmar (Burmese)',
    'Nepali',
    'Nyanja (Chichewa)',
    'Pashto',
    'Persian',
    'Polish',
    'Portuguese (Portugal, Brazil)',
    'Punjabi',
    'Romanian',
    'Russian',
    'Samoan',
    'Scots Gaelic',
    'Serbian',
    'Sesotho',
    'Shona',
    'Sindhi',
    'Sinhala (Sinhalese)',
    'Slovak',
    'Slovenian',
    'Somali',
    'Spanish',
    'Sundanese',
    'Swahili',
    'Swedish',
    'Tagalog (Filipino)',
    'Tajik',
    'Tamil',
    'Telugu',
    'Thai',
    'Turkish',
    'Ukrainian',
    'Urdu',
    'Uzbek',
    'Vietnamese',
    'Welsh',
    'Xhosa',
    'Yiddish',
    'Yoruba',
    'Zulu'
  ];
  
  
  Translator.prototype.languageCodes = [
    'en',
    'de',
    'no',
    '',
    'af',
    'sq',
    'am',
    'ar',
    'hy',
    'az',
    'eu',
    'be',
    'bn',
    'bs',
    'bg',
    'ca',
    'ceb',
    'zh-CN',
    'zh-TW',
    'co',
    'hr',
    'cs',
    'da',
    'nl',
    'eo',
    'et',
    'fi',
    'fr',
    'fy',
    'gl',
    'ka',
    'el',
    'gu',
    'ht',
    'ha',
    'haw',
    'iw',
    'hi',
    'hmn',
    'hu',
    'is',
    'ig',
    'id',
    'ga',
    'it',
    'ja',
    'jw',
    'kn',
    'kk',
    'km',
    'ko',
    'ku',
    'ky',
    'lo',
    'la',
    'lv',
    'lt',
    'lb',
    'mk',
    'mg',
    'ms',
    'ml',
    'mt',
    'mi',
    'mr',
    'mn',
    'my',
    'ne',
    'ny',
    'ps',
    'fa',
    'pl',
    'pt',
    'pa',
    'ro',
    'ru',
    'sm',
    'gd',
    'sr',
    'st',
    'sn',
    'sd',
    'si',
    'sk',
    'sl',
    'so',
    'es',
    'su',
    'sw',
    'sv',
    'tl',
    'tg',
    'ta',
    'te',
    'th',
    'tr',
    'uk',
    'ur',
    'uz',
    'vi',
    'cy',
    'xh',
    'yi',
    'yo',
    'zu'
  ];
  


Translator.prototype.translateSelection = function (context) {

    var dialog = this.createWindow( context, 'Translate Selection' );
    var languageIndex = handleAlertResponse(dialog, dialog.runModal());
    
    if (languageIndex == null) {return}

    var selection      = context.selection,
        container      = undefined,
        toLanguage     = this.languageCodes[languageIndex];

    if ( selection.length == 0 ) {
        // Window: You have nothing selected. Do you want to translate the entire page? 
        selection = selectLayersOfTypeInContainer(context.document, "MSArtboardGroup", getCurrentPage(context) );
    }

    for ( var i = 0; i < selection.length; i++ ) {
        
        if ( isArtboard(selection[i]) ) {
            
            artboard = selection[i];
            ( sketchVersion > 45) ? artboard.select_byExpandingSelection(true, false) : artboard.select_byExtendingSelection(true, false);

            var symbolInstances = selectLayersOfTypeInContainer(context.document, "MSSymbolInstance", artboard);
            for ( var j = 0; j < symbolInstances.length; j++ ) {
                translateOverridesInSelection( symbolInstances[j], toLanguage );
            }

            var textLayers      = selectLayersOfTypeInContainer(context.document, "MSTextLayer", artboard);
            for ( var j = 0; j < textLayers.length; j++ ) {
                translateTextLayersInSelection( textLayers[j], toLanguage )
            }

        }

        if ( isText(selection[i]) ) {
            translateTextLayersInSelection( selection[i], toLanguage )
        }

        if ( isSymbol(selection[i]) ) {
            translateOverridesInSelection( selection[i], toLanguage );
        }

    }

}


Translator.prototype.translatePage = function (context) {
    
    var doc         = context.document;
    var thisPage    = [doc currentPage];
    var artboards   = [thisPage artboards];
    
    if (artboards.length === 0) {return}
    
    var dialog          = this.createWindow( context,'Translate Current Page' );
    var languageIndex   = handleAlertResponse(dialog, dialog.runModal());
    
    if (languageIndex == null) {return}

    var toLanguage = this.languageCodes[languageIndex];
    var page       = getCurrentPage(context);

    var artboards = selectLayersOfTypeInContainer(context.document, "MSArtboardGroup", page);
    for ( var i = 0; i < artboards.length; i++ ) {

        artboard = artboards[i];

        var sketchVersion = MSApplicationMetadata.metadata().appVersion;
        ( sketchVersion > 45) ? artboard.select_byExpandingSelection(true, false) : artboard.select_byExtendingSelection(true, false);

        var symbolInstances = selectLayersOfTypeInContainer(context.document, "MSSymbolInstance", artboard);
        for ( var j = 0; j < symbolInstances.length; j++ ) {
            translateOverridesInSelection( symbolInstances[j], toLanguage );
        }

        var textLayers      = selectLayersOfTypeInContainer(context.document, "MSTextLayer", artboard);
        for ( var j = 0; j < textLayers.length; j++ ) {
            translateTextLayersInSelection( textLayers[j], toLanguage )
        }
    }
}

Translator.prototype.translateDocument = function (context) {

    var doc      = context.document;
    var pages    = [doc pages];

    var dialog          = this.createWindow( context, 'Translate Entire Document' );
    var languageIndex   = handleAlertResponse(dialog, dialog.runModal());
    
    if (languageIndex == null) {return}
    var toLanguage = this.languageCodes[languageIndex];
    
    for ( var j = 0; j < pages.length; j++ ) {

        var thisPage  = pages[j];
        var artboards = [thisPage artboards];

        log(pages[j])

        [doc setCurrentPage:thisPage];
        
        if (artboards.length === 0) {return}

        var artboards = selectLayersOfTypeInContainer(context.document, "MSArtboardGroup", thisPage);
        
        for ( var i = 0; i < artboards.length; i++ ) {
    
            artboard = artboards[i];
    
            var sketchVersion = MSApplicationMetadata.metadata().appVersion;
            ( sketchVersion > 45) ? artboard.select_byExpandingSelection(true, false) : artboard.select_byExtendingSelection(true, false);
    
            var symbolInstances = selectLayersOfTypeInContainer(context.document, "MSSymbolInstance", artboard);
            for ( var j = 0; j < symbolInstances.length; j++ ) {
                translateOverridesInSelection( symbolInstances[j], toLanguage );
            }
    
            var textLayers      = selectLayersOfTypeInContainer(context.document, "MSTextLayer", artboard);
            for ( var j = 0; j < textLayers.length; j++ ) {
                translateTextLayersInSelection( textLayers[j], toLanguage )
            }
        }

    }
    
}


Translator.prototype.createWindow = function(context, title) {

    var apiKey          = getOption('apiKey', '');
    var dialogWindow    = COSAlertWindow.new();
    var informativeText = apiKey.length == 0 ? 'You have to set your Google API Key into the plugin settings (Plugins > Translate > Set Google API Key...)' : 'Please select the language in which you want to translate the text:';
    var title           = title || 'Sketch Translate';

    dialogWindow.setMessageText(title);
    dialogWindow.setInformativeText(informativeText);
    
    if (apiKey.length == 0) {

        var link = NSButton.alloc().initWithFrame( NSMakeRect(0, 0, 200, 20) );

        link.setTitle('How to get a Google API Key');
        link.setBezelStyle(NSInlineBezelStyle);
        link.setCOSJSTargetFunction(function() {

            var url = NSURL.URLWithString(@"https://github.com/eddiesigner/sketch-translate-me/wiki/Generate-a-Google-API-Key");
            
            if (!NSWorkspace.sharedWorkspace().openURL(url)) {
                log( @"Failed to open url:" + url.description() );
            }

        });
        
        dialogWindow.addAccessoryView(link);

    } else {

        var languageSelect = createSelect(this.languageLabels);
        dialogWindow.addAccessoryView(languageSelect);
        
        dialogWindow.addButtonWithTitle('OK');
        dialogWindow.addButtonWithTitle('Cancel');

    }

    dialogWindow.setIcon(NSImage.alloc().initByReferencingFile(context.plugin.urlForResourceNamed("logo@2x.png").path()));
    return dialogWindow;
}


Translator.prototype.openKeyWindow = function(context) {
    var dialog   = this.createKeyWindow( context, 'Set Google API Key' );
    var response = handleKeyAlertResponse(dialog, dialog.runModal());
}


Translator.prototype.createKeyWindow = function(context, title) {
    var apiKey = getOption('apiKey', '');
    var dialogWindow = COSAlertWindow.new();
    
    dialogWindow.setMessageText( title );
    dialogWindow.setInformativeText('Paste here your Google API Key (you have to do this just once):');
    
    dialogWindow.addTextFieldWithValue(apiKey.length == 0 ? '' : getOption('apiKey'));
    
    var apiKeyTextBox = dialogWindow.viewAtIndex(0);
    
    dialogWindow.alert().window().setInitialFirstResponder(apiKeyTextBox);
    
    dialogWindow.addButtonWithTitle('OK');
    dialogWindow.addButtonWithTitle('Cancel');
    
    dialogWindow.setIcon(NSImage.alloc().initByReferencingFile(context.plugin.urlForResourceNamed("logo@2x.png").path()));
    return dialogWindow;
}