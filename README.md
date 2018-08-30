<img src="https://github.com/symdesign/sketch-auto-translate/raw/master/Assets/logo%402x.png" width="100" height="100" alt="Sketch Auto Translate Plugin">
  
# Sketch Auto Translate Plugin
Plugin for [Sketch](https://www.sketchapp.com/) to translate Text Layers and Symbol Overrides via Google Translate. [Read more about its origin on medium.com](https://medium.com/sketch-app-sources/sketch-auto-translate-plugin-fd8f021faa30).


<a href="https://www.sketchpacks.com/symdesign/sketch-auto-translate/install">
  <img width="160" height="41" src="https://sketchpacks-com.s3.amazonaws.com/assets/badges/sketchpacks-badge-install.png" >
</a>


<style>
.btn {
	  display: block;
	  margin: 40px auto 0px;
    width: 160px;
    text-align: center;
    background: #FDAB2A;
    border-radius: 3px;
    box-shadow: 0 10px 20px -8px #E0B97B;
    padding: 10px 17px;
    margin: 10px 0;
    font-size: 18px;
    cursor: pointer;
    border: none;
    outline: none;
    color: #021F69;
    text-decoration: none !important;
    -webkit-transition: 0.3s ease;
    transition: 0.3s ease;
}
.btn:hover {
	  transform: translateY(-3px);
}
.btn .fa {
	  margin-right: 5px;
}
</style>

<hr>
<a href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=ZK3TU55XHALSE">
<div class="btn">Donate</div>
<img width="160" height="auto" src="https://github.com/symdesign/sketch-auto-translate/raw/master/Assets/cc-badge-powevered.png"/ ></a>


## Translate Selection
Translates your selection on the current page no matter which type, apart from Symbols.

Shortcut: `⇧` `⌘` `X` Translate Selection

<img src="https://raw.githubusercontent.com/symdesign/sketch-auto-translate/master/Assets/TranslateSelection.gif" alt="Screen Recording 'Translate Selection'" >


## Translate Current Page
Translates all Text Layers and Symbol Overrides on Artboards in your current Page but skips them out if placed outside.

Shortcut: `⇧` `⌘` `P` Translate Current **P**age

<img src="https://raw.githubusercontent.com/symdesign/sketch-auto-translate/master/Assets/TranslatePage.gif" alt="Screen Recording 'Translate Current Page'" >

## Translate Entire Document
Translates all Text Layers and Symbol Overrides in the file that are on Artboards but skips them if placed inside a Symbol or outside an Artboard. I made this decision to avoid messing with the file structure.

Shortcut: `⇧` `⌘` `D` Translate Entire **D**ocument

<img src="https://raw.githubusercontent.com/symdesign/sketch-auto-translate/master/Assets/TranslateEntireDocument.gif" alt="Screen Recording 'Translate Entire Document'" >


## Set Google API Key...
To create a Google Translate API Key you need a paid account. Luckily, Google offers a [One Year Free Trial](https://console.cloud.google.com/freetrial) where it gives you away $300 in credits. 

This means, as long as you don't exceed that amount (within one year) you won't have to pay anything. [Check out their pricing](https://cloud.google.com/translate/pricing) to find out how many Language Detections and Translations this is.


### 1. Create a new Project
To create your application’s API key please go to the [Cloud Platform Console](https://console.cloud.google.com/) and create a new project and give it a name you prefer.


### 2. Enable Google Cloud Translation API
With the new project selected, go to `API & Services > Credentials`.
At the Credentials page search for the *Google Cloud Translation API* and enable it.


### 3. Create API Key
Go to `API & Services > Credentials` again and click the button `Create credentials` inside the credentials card.


### 4. Use API Key

Copy your API Key, go back to Sketch and select `Plugins > Translate > Set Google API Key...` in the menu. After that you get prompted to paste your key.
