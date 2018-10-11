@import "common.js";

function Translator () {}

Translator.prototype.languageLabels = [
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
    'English',
    'Esperanto',
    'Estonian',
    'Finnish',
    'French',
    'Frisian',
    'Galician',
    'Georgian',
    'German',
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
    'Norwegian',
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
    'en',
    'eo',
    'et',
    'fi',
    'fr',
    'fy',
    'gl',
    'ka',
    'de',
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
    'no',
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
    
    var dialog          = this.createWindow( context,'Translate Current Page' );
    var languageIndex   = handleAlertResponse(dialog, dialog.runModal());
    
    if (languageIndex == null) {return}

    var toLanguage = this.languageCodes[languageIndex];
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
                translateOverridesInSelection( symbolInstances[j], toLanguage );
            }
    
            var textLayers = selectLayersOfTypeInContainer(context.document, "MSTextLayer", artboard);
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

        var link = NSButton.alloc().initWithFrame( NSMakeRect(0, 0, 300, 24) );
        link.setTitle('Get a Google API Key');
        link.setBezelStyle(NSBezelStyleTexturedRounded);
        link.setCOSJSTargetFunction(function() {
    
            var url = NSURL.URLWithString(@"https://github.com/symdesign/sketch-auto-translate/wiki/Get-a-Google-API-key");
            
            if (!NSWorkspace.sharedWorkspace().openURL(url)) {
                log( @"Failed to open url:" + url.description() );
            }
    
        });
        dialogWindow.addAccessoryView(link);
    
        var tf = NSTextView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 40));
        //tf.setTextColor(color);
        //tf.setFont(NSFont.systemFontOfSize(size));
        tf.setString('After one year of free usage, you will be charged by Google per translated character.\n');
        tf.setEditable(false);
        tf.setDrawsBackground(false);
        dialogWindow.addAccessoryView(tf);
    
    
        var link = NSButton.alloc().initWithFrame( NSMakeRect(0, 0, 300, 24) );
        link.setTitle('Use without API key');
        link.setBezelStyle(NSBezelStyleTexturedRounded);
        link.setCOSJSTargetFunction(function() {
    
            var url = NSURL.URLWithString(@"https://github.com/symdesign/sketch-auto-translate/wiki/Use-without-API-Key");
            
            if (!NSWorkspace.sharedWorkspace().openURL(url)) {
                log( @"Failed to open url:" + url.description() );
            }
    
        });
        dialogWindow.addAccessoryView(link);
    
        var tf = NSTextView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 40));
        tf.setString('No signup or recurring costs after a flat one-time payment.');
        tf.setEditable(false);
        tf.setDrawsBackground(false);
        dialogWindow.addAccessoryView(tf);

    } else {

        var lastSelect = String( getOption('toLanguage', 'en') );
        var languageSelect = createSelect(this.languageLabels);
        languageSelect.selectItemAtIndex( this.languageCodes.indexOf( lastSelect ) )
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
    dialogWindow.setInformativeText('Paste here your Google API Key:');
    dialogWindow.addTextFieldWithValue(apiKey.length == 0 ? '' : getOption('apiKey'));

    var tf = NSTextView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 24));
    //tf.setTextColor(color);
    tf.setFont(NSFont.systemFontOfSize( 14 ));
    tf.setString('\nNeed Help?');
    tf.setEditable(false);
    tf.setDrawsBackground(false);
    dialogWindow.addAccessoryView(tf);

    var link = NSButton.alloc().initWithFrame( NSMakeRect(0, 0, 300, 20) );
    link.setTitle('Get a Google API Key');
    link.setBezelStyle(NSBezelStyleTexturedRounded);
    link.setCOSJSTargetFunction(function() {

        var url = NSURL.URLWithString(@"https://github.com/symdesign/sketch-auto-translate/wiki/Get-a-Google-API-key");
        
        if (!NSWorkspace.sharedWorkspace().openURL(url)) {
            log( @"Failed to open url:" + url.description() );
        }

    });
    dialogWindow.addAccessoryView(link);

    var tf = NSTextView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 40));
    //tf.setTextColor(color);
    //tf.setFont(NSFont.systemFontOfSize(size));
    tf.setString('After one year of free usage, you will be charged by Google per translated character.\n');
    tf.setEditable(false);
    tf.setDrawsBackground(false);
    dialogWindow.addAccessoryView(tf);


    var link = NSButton.alloc().initWithFrame( NSMakeRect(0, 0, 300, 20) );
    link.setTitle('Use without API key');
    link.setBezelStyle(NSBezelStyleTexturedRounded);
    link.setCOSJSTargetFunction(function() {

        var url = NSURL.URLWithString(@"https://github.com/symdesign/sketch-auto-translate/wiki/Use-without-API-Key");
        
        if (!NSWorkspace.sharedWorkspace().openURL(url)) {
            log( @"Failed to open url:" + url.description() );
        }

    });
    dialogWindow.addAccessoryView(link);

    var tf = NSTextView.alloc().initWithFrame(NSMakeRect(0, 0, 300, 40));
    tf.setString('No signup or recurring costs after a flat one-time payment.');
    tf.setEditable(false);
    tf.setDrawsBackground(false);
    dialogWindow.addAccessoryView(tf);

    
    var apiKeyTextBox = dialogWindow.viewAtIndex(0);
    
    dialogWindow.alert().window().setInitialFirstResponder(apiKeyTextBox);
    
    dialogWindow.addButtonWithTitle('OK');
    dialogWindow.addButtonWithTitle('Cancel');
    
    dialogWindow.setIcon(NSImage.alloc().initByReferencingFile(context.plugin.urlForResourceNamed("logo@2x.png").path()));
    return dialogWindow;
}
