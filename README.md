# @atrament/core

`@atrament/core` is a framework for choice-based games, built around `InkJS`. It is a foundation of an [@atrament/web](https://github.com/technix/atrament-web) library and [atrament-ui](https://github.com/technix/atrament-web-ui) web application.

**[Documentation](https://atrament.ink)**

## Features

- Implements game flow: loading Ink story, getting text content, making choices
- Manages global application settings
- Parses tags, and handles some of them (mostly compatible with Inky)
- Auto-observe variables defined with 'observe' global tag
- Manages sound and music via knot tags
- Manages autosaves, checkpoints, and named saves for every game
- Music state is saved and restored along with game state
- All changes affect the internal state


## Installation

```npm install @atrament/core```

## Tags handled by Atrament

### Global tags

| Tag | Description                |
| :-------- | :------------------------- |
| `# observe: varName` | Register variable observer for `varName` Ink variable. The variable value is available in the `vars` section of Atrament state. |
| `# persist: varName` | Save this variable value to persistent storage, and restore it before the game starts. |
| `# autosave: false` | Disables autosaves. |
| `# single_scene` | Store only the last scene in the Atrament state. |
| `# continue_maximally: false` | Pause story after each line. In this mode the `scene` object contains the `canContinue` field, which is set to true if the story can be continued. |


### Knot tags
| Tag | Description                |
| :-------- | :------------------------- |
| `# CLEAR` | Clear the scenes list before saving the current scene to Atrament state. |
| `# AUDIO: sound.mp3` | Play sound (once). |
| `# AUDIOLOOP: music.mp3` | Play background music (looped). There can be only one background music track. |
| `# AUDIOLOOP: false` | Stop playing all background music. |
| `# PLAY_SOUND: sound.mp3` | Play sound (once). |
| `# STOP_SOUND: sound.mp3` | Stop playing specific sound. |
| `# STOP_SOUND` | Stop playing all sounds. |
| `# PLAY_MUSIC: music.mp3` | Play background music (looped). There can be multiple background music tracks, played simultaneously. |
| `# STOP_MUSIC: music.mp3` | Stop playing specific background music. |
| `# STOP_MUSIC` | Stop playing all background music. |
| `# CHECKPOINT` | Save the game to the default checkpoint. |
| `# CHECKPOINT: checkpointName` | Save the game to checkpoint `checkpointName`. |
| `# SAVEGAME: saveslot` | Save the game to `saveslot`. |
| `# RESTART` | Start game from beginning. |
| `# RESTART_FROM_CHECKPOINT` | Restart the game from the latest checkpoint. |
| `# RESTART_FROM_CHECKPOINT: checkpointName` | Restart game from named checkpoint. |
| `# IMAGE: picture.jpg` | Adds specified image to the `images` attribute of the scene and paragraph. It can be used to preload image files for the scene. |

Note: For sound effects, please use either AUDIO/AUDIOLOOP or PLAY_SOUND/PLAY_MUSIC/STOP_SOUND/STOP_MUSIC tags. Combining them may lead to unexpected side effects.

### Choice tags
| Tag | Description                |
| :-------- | :------------------------- |
| `# UNCLICKABLE` | Alternative names: `#DISABLED`, `#INACTIVE`.<br>Sets `disabled: true` attribute to the choice. |

## API Reference

#### atrament.version

Atrament version string. Read-only. 

### Base methods

#### atrament.defineInterfaces()

Defines interface modules for:
- **loader**: ink file loader
- **persistent**: persistent storage
- **sound**: sound control (optional)
- **state**: state management

Interfaces should be defined **before** calling any other methods.

```
atrament.defineInterfaces({
    loader: interfaceLoader,
    persistent: persistentInterface,
    sound: soundInterface,
    state: stateInterface
});
```

#### atrament.init(Story, configuration)

Initialize the game engine. Takes two parameters:
- **Story** is an inkjs constructor, imported directly from inkjs
- **configuration** is a configuration object:
    - **applicationID** should be a unique string. It is used to distinguish persistent storage of your application.
    - **settings** is a default settings object. These settings are immediately applied.

```
import {Story} from 'inkjs';
const config = {
    applicationID: 'your-application-id',
    settings: {
        mute: true,
        volume: 10,
        fullscreen: true
    }
}
atrament.init(Story, config);
```

#### atrament.on(event, listener)

Subscribe to specific Atrament events. The **listener** function is called with a single argument containing event parameters.

You can subscribe to all Atrament events:
```
atrament.on('*', (event, args) => { ... });
```

#### atrament.off(event, listener)

Unsubscribe specified listener from the Atrament event.

#### atrament.emit(event, message)

Emit an Atrament event.

#### atrament.state

Returns Atrament state interface. Can be used to operate state directly:

```
atrament.state.setSubkey('game', 'checkpoint', true);
```

#### atrament.store

Return raw store object. It can be used in hooks, for example:

```
const gamestate = useStore(atrament.store);
```

#### atrament.interfaces

Returns raw interface objects. It can be used to operate with them directly.

```
const { state, persistent } = atrament.interfaces;
```

### Game methods

#### async atrament.game.init(path, file, gameID)

Initialize game object. It is required to perform operations with saves.
Parameters:
- path: path to Ink file
- file: Ink file name
- gameID: optional. If provided, Atrament will use the given ID for save management. Otherwise, it will be generated based on path and filename.

Event: `'game/init', { pathToInkFile: path, inkFile: file }`

#### async atrament.game.initInkStory()

Load Ink file and initialize Ink Story object. Then it updates game metadata and initializes variable observers.

Event: `'game/initInkStory'`

#### atrament.game.getSaveSlotKey({ name, type })

Returns save slot identifier for given save name and type.
Possible save types: `atrament.game.SAVE_GAME`, `atrament.game.SAVE_CHECKPOINT`, `atrament.game.SAVE_AUTOSAVE`. For autosaves, the `name` parameter should be omitted.
The returned value can be used as a `saveslot` parameter.

#### async atrament.game.start(saveslot)

If the game is started for the first time, or the initialized game is not the same as the current one - call `initInkStory` first.
Clears game state, and gets initial data for variable observers.
If `saveslot` is defined, load state from specified save.

Event: `'game/start', { saveSlot: saveslot }`

#### async atrament.game.resume()

Resume saved game:
- if autosave exists, resume from autosave
- if checkpoints exist, resume from the newest checkpoint
- otherwise, start a new game

Event: `'game/resume', { saveSlot: saveslot }`

#### async atrament.game.canResume()

Returns save slot identifier if game can be resumed.

Event: `'game/canResume', { saveSlot: saveslot }`

#### async atrament.game.restart(saveslot)

Restart the game from the specified save slot (if `saveslot` is not defined, start a new game). 

Event: `'game/restart', { saveSlot: saveslot }`

#### async atrament.game.restartFromCheckpoint(name)

Restart the game from the checkpoint with the given name (if no such checkpoint found, restart the game).

#### async atrament.game.load(saveslot)

Load game state from specified save slot. 

Event: `'game/load', saveslot`

#### async atrament.game.saveGame(name, description)

Save game state to save slot. The `description` parameter is optional.

Event: `'game/save', { type: 'game', saveslot, description }`

#### async atrament.game.saveCheckpoint(name)

Save the game state to the checkpoint.

Event: `'game/save', { type: 'checkpoint', name }`

#### async atrament.game.saveAutosave()

Save the game state to autosave slot.

Event: `'game/save', { type: 'autosave' }`

#### async atrament.game.listSaves()

Returns array of all existing saves for active game.

Event: `'game/listSaves', savesListArray`

#### async atrament.game.removeSave(saveslot)

Removes specified game save slot.

Event: `'game/removeSave', saveslot`

#### async atrament.game.existSave(saveslot)

Returns `true` if specified save slot exists.

#### atrament.game.continueStory()

- gets Ink scene content
- run scene processors
- process tags
- updates Atrament state with a scene content

Event: `'game/continueStory'`

Event for tag handling: `'game/handleTag', { [tagName]: tagValue }`

#### atrament.game.makeChoice(id)

Make a choice in Ink. Wrapper for `atrament.ink.makeChoice`.

#### atrament.game.defineSceneProcessor(processorFunction)

Register `processorFunction` for scene post-processing. It takes the `scene` object as an argument by reference:

```
function processCheckpoint(scene) {
    if (scene.tags.CHECKPOINT) {
        scene.is_checkpoint = true;
    }
}
atrament.game.defineSceneProcessor(processCheckpoint);

```

#### atrament.game.getAssetPath(file)

Returns the full path to asset file (image, sound, music).

#### atrament.game.clear()

Method to call at the game end. It stops music, and clears `scenes` and `vars` in the Atrament state.

Event: `'game/clear'`

#### atrament.game.reset()

Method to call at the game end. It calls `atrament.game.clear()`, then clears `metadata` and `game` in Atrament state.

Event: `'game/reset'`

#### atrament.game.getSession()

Returns current game session.

#### atrament.game.setSession(sessionID)

Sets current game session. If set to empty value, reset session ID to default.

Event: `'game/setSession', sessionID`

#### async atrament.game.getSessions()

Returns list of existing sessions in a `{ sessionName: numberOfSaves, ... }` format.

Event: `'game/getSessions', sessionList`

#### async atrament.game.deleteSession(sessionID)

Delete all saves for a given session.

Event: `'game/deleteSession', sessionID`

#### atrament.game.getState()

Get state object for the game (ink state, "game" and "scenes" state keys)

#### atrament.game.setState(gameState)

Set the game state from the provided object (same as returned by getState)


### Ink methods

#### atrament.ink.initStory()

Initializes Ink story with loaded content.

Event: `'ink/initStory'`
#### atrament.ink.story()

Returns current Story instance.

#### atrament.ink.loadState(state)

Load Ink state from JSON.

#### atrament.ink.getState()

Returns current Ink state as JSON object.

#### atrament.ink.makeChoice(id)

Wrapper for `Story.ChooseChoiceIndex`.

Event: `'ink/makeChoice', { id: choiceId }`

#### atrament.ink.getVisitCount(ref)

Wrapper for `Story.VisitCountAtPathString`.

Event: `'ink/getVisitCount', { ref: ref, visitCount: value }`

#### atrament.ink.evaluateFunction(functionName, argsArray)

Evaluates Ink function, then returns the result of the evaluation. Wrapper for `Story.EvaluateFunction`.

Event: `'ink/evaluateFunction', { function: functionName, args: argsArray, result: functionReturnValue }`

#### atrament.ink.getGlobalTags()

Returns parsed Ink global tags.

Event: `'ink/getGlobalTags', { globalTags: globalTagsObject }`

#### atrament.ink.getVariable(variableName)

Returns value of specified Ink variable.

Event: `'ink/getVariable', { name: variableName }`

#### atrament.ink.getVariables()

Returns all variables and their values as a key-value object.

Event: `'ink/getVariables', inkVariablesObject`

#### atrament.ink.setVariable(variableName, value)

Sets value of specified Ink variable.

Event: `'ink/setVariable', { name: variableName, value: value }`

#### atrament.ink.observeVariable(variableName, observerFunction)

Registers observer for a specified variable. Wrapper for `Story.ObserveVariable`.

#### atrament.ink.goTo(ref)

Go to the specified Ink knot or stitch. Wrapper for `Story.ChoosePathString`.

Event: `'ink/goTo', { knot: ref }`

#### atrament.ink.onError(errorCallback)

When an Ink error occurs, it emits `ink/onError` event and calls the `errorCallback` function with the error event object as an argument.

Event: `'ink/onError', errorEvent`

#### atrament.ink.getScene()

Returns **Scene** object.

Event: `'ink/getScene', { scene: sceneObject }`

### Settings methods

Application settings for your application. Loading, saving, and setting values changes the `settings` section of the Atrament state.

However, if you need to perform additional actions when the setting is changed, you can define a handler for it - see below. By default, Atrament handles `mute` and `volume` settings this way, muting and setting sound volume respectively.

#### async atrament.settings.load()

Load settings from persistent storage to Atrament state.

Event: `'settings/load'`

#### async atrament.settings.save()

Save settings to persistent storage.

Event: `'settings/save'`

#### atrament.settings.get(parameter)

Returns value of the setting.

Event: `'settings/get', { name: parameter }`

#### atrament.settings.set(parameter, value)

Sets value of setting.

Event: `'settings/set', { name: parameter, value: value }`

#### atrament.settings.toggle(parameter)

Toggles setting (sets `true` to `false` and vice versa).

#### atrament.settings.reset()

Resets settings to their defaults.

Event: `'settings/reset', defaultSettingsObject`

#### atrament.settings.defineHandler(parameter, handlerFunction)

Defines a settings handler. 

For example, you have to run some JavaScript code to toggle fullscreen mode in your app.

```
const fullscreenHandler = (oldValue, newValue) => {
    // do some actions
}

atrament.settings.defineHandler('fullscreen', fullscreenHandler);

// later...

atrament.toggle('fullscreen');
// or
atrament.set('fullscreen', true);

// both these methods will change the setting and run the corresponding handler
```


## Scene object

```
{
  content: [],
  text: [],
  tags: {},
  choices: [],
  images: [],
  sounds: [],
  music: [],
  isEmpty: Boolean,
  uuid: Number
}
```

| Key | Description                |
| :-------- | :------------------------- |
| `content` | Array of Ink paragraphs: `{text: '', tags: {}, images: [], sounds: [], music: []}` |
| `text` | Array of all story text from all paragraphs of this scene |
| `tags` | Array of all tags from all paragraphs of this scene |
| `choices` | Array of choice objects: `{ id: 0, choice: 'Choice Text', tags: {}}` |
| `images` | Array of all images from all paragraphs of this scene |
| `sound` | Array of all sounds from all paragraphs of this scene |
| `music` | Array of all music tracks from all paragraphs of this scene |
| `isEmpty` | True if there is no text content in the scene |
| `uuid` | Unique ID of the scene (`Date.now()`) |


## State structure

```
{
  settings: {},
  game: {},
  metadata: {},
  scenes: [],
  vars: {} 
}
```

| Key | Description                |
| :-------- | :------------------------- |
| `settings` | Single-level key-value store for application settings |
| `game` | Single-level game-specific data. Atrament populates the following keys: *$pathToInkFile, $inkFile, $gameUUID* |
| `metadata` | Data loaded from Ink file global tags |
| `scenes` | Array of game scenes |
| `vars` | Names and values of auto-observed variables |

## Save structure

```
{ id, date, state, game, scenes }
```
| Key | Description                |
| :-------- | :------------------------- |
| `id` | Save slot ID |
| `date` | Save timestamp |
| `state` | JSON structure of Ink state |
| `game` | Content of `game` from Atrament state |
| `scenes` | Content of `scenes` from Atrament state |

Please note that `metadata` and `vars` from the Atrament state are not included in the save. However, they are automatically populated from the Ink state after loading from a save.


## Interfaces

`atrament-core` uses dependency injection. It uses inkjs `Story` constructor 'as-is', and uses custom interfaces for other libraries.

There are four interfaces in `atrament-core`. Their implementation is not included, so developers can use `atrament-core` with the libraries they like. 

### loader
Interface to file operations. The function `init` will be called first, taking the path to the game as a parameter. The function `getAssetPath` should return the full path of a given file. The async function `loadInk` should return the content of a given Ink file, located in the folder defined at the initialization time.

```
{
    async init(path)
    getAssetPath(filename)
    async loadInk(filename)
}
```

### persistent
Interface to persistent storage library.

```
{
  init()
  async exists(key)
  async get()
  async set(key)
  async remove(key)
  async keys()
}
```

### state
Interface to state management library.

```
{
  store()
  get()
  setKey(key, value)
  toggleKey(key)
  appendKey(key, value)
  setSubkey(key, subkey, value)
  toggleSubkey(key, subkey)
  appendSubkey(key, subkey, value)
}
```

### sound
Interface to sound management library.
```
{
  init(defaultSettings)
  mute(flag)
  isMuted()
  setVolume(volume)
  getVolume()
  playSound(soundFile)
  stopSound(soundFile|undefined)
  playMusic(musicFile)
  stopMusic(musicFile|undefined)
}
```

## LICENSE

Atrament is distributed under MIT license.

Copyright (c) 2023 Serhii "techniX" Mozhaiskyi

Made with the support of the [Interactive Fiction Technology Foundation](https://iftechfoundation.org/)

<img src="https://iftechfoundation.org/logo.svg" width="200px">


