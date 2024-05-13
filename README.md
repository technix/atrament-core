# Atrament

`atrament-core` is a framework for choice-based games, built around `inkjs`. 

If you need a ready to use library for web applications, check out [atrament-web](https://github.com/technix/atrament-web).

If you are looking for example of a web application based on Atrament, check out [atrament-preact-ui](https://github.com/technix/atrament-preact-ui).

## Features

- Implements game flow: loading Ink story, get content, make choice
- Manages global application settings
- Parses tags, handles some of them (compatible with Inky)
- Auto-observe variables defined with 'observe' global tag
- Manages sound and music via knot tags
- Manages autosaves, checkpoints, and named saves for every game
- Music state is saved and restored along with game state
- All changes affect internal state


## Installation

```npm install @atrament/core```

## Tags handled by Atrament

### Global tags

| Tag | Description                |
| :-------- | :------------------------- |
| `# observe: varName` | Register variable observer for `varName` Ink variable. Variable value is available in `vars` section of Atrament state. |
| `# autosave: false` | Disables autosaves. |
| `# single_scene` | Store only last scene in Atrament state. |

### Knot tags
| Tag | Description                |
| :-------- | :------------------------- |
| `# CLEAR` | Clear scenes list before saving current scene to Atrament state. |
| `# AUDIO: sound.mp3` | Play sound (once). |
| `# AUDIOLOOP: music.mp3` | Play background music (looped). |
| `# AUDIOLOOP: false` | Stop playing music. |
| `# PLAY_SOUND: sound.mp3` | Play sound (once). |
| `# STOP_SOUND: sound.mp3` | Stop playing specific sound. |
| `# STOP_SOUND` | Stop playing all sounds. |
| `# PLAY_MUSIC: music.mp3` | Play background music (looped). |
| `# STOP_MUSIC: music.mp3` | Stop playing specific background music. |
| `# STOP_MUSIC` | Stop playing all background music. |
| `# CHECKPOINT` | Save game to 'default' checkpoint. |
| `# CHECKPOINT: checkpointName` | Save game to  checkpoint `checkpointName`. |
| `# SAVEGAME: saveslot` | Save game to `saveslot`. |
| `# RESTART` | Start game from beginning. |
| `# RESTART_FROM_CHECKPOINT` | Restart game from latest checkpoint. |
| `# RESTART_FROM_CHECKPOINT: checkpointName` | Restart game from named checkpoint. |

Note: For sound effects, please use either AUDIO/AUDIOLOOP or PLAY_SOUND/PLAY_MUSIC/STOP_SOUND/STOP_MUSIC tags. Combining them may lead to unexpected side effects.

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

Initialize game engine. Takes two parameters:
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

Subscribe to specific Atrament event. The **listener** function is called with single argument containing event parameters.

You can subscribe to all Atrament events:
```
atrament.on('*', (event, args) => { ... });
```

#### atrament.off(event, listener)

Unsubscribe listener from specific Atrament event.

#### atrament.state

Returns Atrament state interface. Can be used to operate state directly:

```
atrament.state.setSubkey('game', 'checkpoint', true);
```

#### atrament.store

Return raw store object. Can be used in hooks, for example:

```
const gamestate = useStore(atrament.store);
```

#### atrament.interfaces

Returns raw interface objects. Can be used to operate with them directly.

```
const { state, persistent } = atrament.interfaces;
```

### Game methods

#### async atrament.game.init(path, file, gameID)

Initialize game object. Required to perform operations with saves.
Parameters:
- path: path to Ink file
- file: Ink file name
- gameID: optional. If provided, Atrament will use given ID for save management. Otherwise, it will be generated based on path and filename.

Event: `'game/init', { pathToInkFile: path, inkFile: file }`

#### async atrament.game.loadInkFile()

Load Ink file, specified on init stage.

Event: `'game/loadInkFile', inkFilename`

#### async atrament.game.initInkStory()

If `loadInkFile` is not called yet, calls it first.
Initializes Ink story, updates game metadata.

Event: `'game/initInkStory'`

#### async atrament.game.start(saveslot)

If `initInkStory` is not called yet, calls it first.
Reset game state, register automated variable observers.
If `saveslot` is defined, load state from specified save.

Event: `'game/start', { saveSlot: saveslot }`

#### async atrament.game.resume()

Resume saved game:
- if autosave exists, resume from autosave
- if checkpoints exist, resume from newest checkpoint
- otherwise, start new game

Event: `'game/resume', { saveSlot: saveslot }`

#### async atrament.game.canResume()

Returns save slot name, if game can be resumed.

Event: `'game/canResume', { saveSlot: saveslot }`

#### async atrament.game.restart(saveslot)

Restart game from specified save slot (if `saveslot` is not defined, starts new game). 

Note: this methods runs `atrament.game.continueStory()` to regenerate game content.

Event: `'game/restart', { saveSlot: saveslot }`

#### async atrament.game.load(saveslot)

Load game state from specified save slot.

Event: `'game/load', saveslot`

#### async atrament.game.save(saveslot)

Save game state to specified save slot.

Event: `'game/save', saveslot`

#### async atrament.game.listSaves()

Returns array of all existing saves for active game.

Event: `'game/listSaves', savesListArray`

#### async atrament.game.removeSave(saveslot)

Removes specified game slot.

Event: `'game/removeSave', saveslot`

#### async atrament.game.existSave(saveslot)

Returns `true` if specified save slot exists.

#### atrament.game.continueStory()

- gets Ink scene content
- run scene processors
- process tags
- updates Atrament state with scene

Event: `'game/continueStory'`

Event for tag handling: `'game/handleTag', { [tagName]: tagValue }`

#### atrament.game.makeChoice(id)

Make choice in Ink. Wrapper for `atrament.ink.makeChoice`.

#### atrament.game.defineSceneProcessor(processorFunction)

Register `processorFunction` for scene post-processing. It takes `scene` object as argument by reference:

```
function processCheckpoint(scene) {
    if (scene.tags.CHECKPOINT) {
        scene.is_checkpoint = true;
    }
}
atrament.game.defineSceneProcessor(processCheckpoint);

```

#### atrament.game.getAssetPath(file)

Returns full path to asset file (image, sound, music).

#### atrament.game.clear()

Method to call at the game end. Stops music, clears `scenes` and `vars` in Atrame state.

Event: `'game/clear'`

#### atrament.game.reset()

Method to call at the game end. Calls `atrament.game.clear()`, then clears `metadata` and `game` in Atrament state.

Event: `'game/reset'`

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

Evaluates Ink function, returns result of evaluation. Wrapper for `Story.EvaluateFunction`.

Event: `'ink/evaluateFunction', { function: functionName, args: argsArray, result: functionReturnValue }`

#### atrament.ink.getGlobalTags()

Returns parsed Ink global tags.

Event: `'ink/getGlobalTags', { globalTags: globalTagsObject }`

#### atrament.ink.getVariable(variableName)

Returns value of specified Ink variable.

Event: `'ink/getVariable', { name: variableName }`

#### atrament.ink.setVariable(variableName, value)

Sets value of specified Ink variable.

Event: `'ink/setVariable', { name: variableName, value: value }`

#### atrament.ink.observeVariable(variableName, observerFunction)

Registers observer for specified variable. Wrapper for `Story.ObserveVariable`.

#### atrament.ink.goTo(ref)

Go to specified Ink knot or stitch. Wrapper for `Story.ChoosePathString`.

Event: `'ink/goTo', { knot: ref }`

#### atrament.ink.getScene()

Returns **Scene** object.

Event: `'ink/getScene', { scene: sceneObject }`

### Settings methods

Application settings for your application. Loading, saving, and setting values changes `settings` section of Atrament state.

However, if you need to perform additional actions when setting is changed, you can define handler for it - see below. By default, Atrament handles `mute` and `volume` settings this way, muting and setting sound volume respectively.

#### async atrament.settings.load()

Load settings from persistent storage to Atrament state.

Event: `'settings/load'`

#### async atrament.settings.save()

Save settings to persistent storage.

Event: `'settings/save'`

#### atrament.settings.get(parameter)

Returns value of setting.

Event: `'settings/get', { name: parameter }`

#### atrament.settings.set(parameter, value)

Sets value of setting.

Event: `'settings/set', { name: parameter, value: value }`

#### atrament.settings.toggle(parameter)

Toggles setting (sets `true` to `false` and vice versa).

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

// both these methods will change setting and run corresponding handler
```


## Scene object

```
{
  content: [],
  text: [],
  tags: {},
  choices: [].
  uuid: Number
}
```

| Key | Description                |
| :-------- | :------------------------- |
| `content` | Array of Ink paragraphs: `{text: '', tags: {}}` |
| `text` | Array of all story text from all paragraphs of this scene |
| `tags` | Array of all tags from all paragraphs of this scene |
| `choices` | Array of choice objects: `{ id: 0, choice: 'Choice Text', tags: []}` |
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
| `settings` | Single level key-value store for application settings |
| `game` | Single level game-specific data. Atrament populates the following keys: *$pathToInkFile, $inkFile, gameUUID* |
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

Please note that `metadata` and `vars` from Atrament state are not included in the save. However, they are automatically populated from Ink state after loading from save.


## Interfaces

`atrament-core` uses dependency injection. It uses inkjs `Story` constructor 'as-is', and uses custom interfaces for other libraries.

There are four interfaces in `atrament-core`. Their implementation is not included, so developers can use `atrament-core` with the libraries they like. 

### loader
Interface to file operations. Function `init` will be called first, taking path to the game as a parameter. Function `getAssetPath` should return full path of given file. Async function `loadInk` should return content of a given Ink file, located in the folder defined at the initialization time.

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
