<img src="https://github.com/symdesign/sketch-auto-translate/raw/master/Translate.sketchplugin/Contents/Resources/logo%402x.png" width="100" height="100" alt="Sketch Auto Translate Plugin">
  
# Sketch Auto Translate Plugin
Plugin for [Sketch](https://www.sketchapp.com/) to translate Text Layers and Symbol Overrides via Google Translate. [Read more about its origin on medium.com](https://medium.com/@symdesign/sketch-auto-translate-plugin-2e0985766228).


## Translate Selection
Translates your selection on the current page no matter which type, apart from Symbols.

Shortcut: `⇧` `⌘` `X` Translate Selection


## Translate Current Page
Translates all Text Layers and Symbol Overrides on Artboards in your current Page but skips them out if placed outside.

Shortcut: `⇧` `⌘` `P` Translate Current **P**age

## Translate Entire Document
Translates all Text Layers and Symbol Overrides in the file that are on Artboards but skips them if placed inside a Symbol or outside an Artboard. I made this decision to avoid messing with the file structure.

Shortcut: `⇧` `⌘` `D` Translate Entire **D**ocument


## Generate a Google API Key
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