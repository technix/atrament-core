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
| `# AUDIOLOOP: music.mp3` <br/> `# MUSIC: music.mp3` | Play music (looped). |
| `# AUDIOLOOP: false` <br/> `# MUSIC: false` | Stop playing music. |
| `# AUDIO: sound.mp3` <br/> `# SOUND: sound.mp3` | Play sound (once). |
| `# CHECKPOINT` | Save game to 'default' checkpoint. |
| `# CHECKPOINT: checkpointName` | Save game to  checkpoint `checkpointName`. |
| `# SAVEGAME: saveslot` | Save game to `saveslot`. |
| `# RESTART` | Start game from beginning. |
| `# RESTART_FROM_CHECKPOINT` | Restart game from latest checkpoint. |
| `# RESTART_FROM_CHECKPOINT: checkpointName` | Restart game from named checkpoint. |

## API Reference

#### atrament.version

Atrament version string. Read-only. 

### Base methods

#### atrament.defineInterfaces()

Defines interface modules for:
- **loader**: ink file loader
- **persistent**: persistent storage
- **sound**: sound control 
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

#### atrament.state()

Returns Atrament state interface. Can be used to operate state directly:

```
atrament.state().setSubkey('game', 'checkpoint', true);
```

#### atrament.store()

Return raw store object. Can be used in hooks, for example:

```
const gamestate = useStore(atrament.store());
```

#### atrament.interfaces()

Returns raw interface objects. Can be used to operate with them directly.

```
const { state, persistent } = atrament.interfaces();
```

### Game methods

#### atrament.game.init(path, file)

Initialize game object. Required to perform operations with saves.
Parameters:
- path: path to Ink file
- file: Ink file name

#### async atrament.game.loadInkFile()

Load Ink file, specified on init stage.

#### async atrament.game.initInkStory()

If `loadInkFile` is not called yet, calls it first.
Initializes Ink story, updates game metadata.

#### async atrament.game.start(saveslot)

If `initInkStory` is not called yet, calls it first.
Reset game state, register automated variable observers.
If `saveslot` is defined, load state from specified save.

#### async atrament.game.resume()

Resume saved game:
- if autosave exists, resume from autosave
- if checkpoints exist, resume from newest checkpoint
- otherwise, start new game

#### async atrament.game.canResume()

Returns save slot name, if game can be resumed.

#### async atrament.game.restart(saveslot)

Restart game from specified save slot (if `saveslot` is not defined, starts new game). 

Note: this methods runs `atrament.game.continueStory()` to regenerate game content.

#### async atrament.game.load(saveslot)

Load game state from specified save slot.

#### async atrament.game.save(saveslot)

Save game state to specified save slot.

#### async atrament.game.listSaves()

Returns array of all existing saves for active game.

#### async atrament.game.removeSave(saveslot)

Removes specified game slot.

#### async atrament.game.existSave(saveslot)

Returns `true` if specified save slot exists.

#### atrament.game.continueStory()

- gets Ink scene content
- run scene processors
- process tags
- updates Atrament state with scene

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

#### atrament.game.reset()

Method to call at the game end. Calls `atrament.game.clear()`, then clears `metadata` and `game` in Atrament state.

### Ink methods

#### atrament.ink.story()

Returns current Story instance.

#### atrament.ink.loadState(state)

Load Ink state from JSON.

#### atrament.ink.getState()

Returns current Ink state as JSON object.

#### atrament.ink.makeChoice(id)

Wrapper for `Story.ChooseChoiceIndex`.

#### atrament.ink.getVisitCount(ref)

Wrapper for `Story.VisitCountAtPathString`.

#### atrament.ink.evaluateFunction(functionName, argsArray)

Evaluates Ink function, returns result of evaluation. Wrapper for `Story.EvaluateFunction`.

#### atrament.ink.getGlobalTags()

Returns parsed Ink global tags.

#### atrament.ink.getVariable(variableName)

Returns value of specified Ink variable.

#### atrament.ink.setVariable(variableName, value)

Sets value of specified Ink variable.

#### atrament.ink.observeVariable(variableName, observerFunction)

Registers observer for specified variable. Wrapper for `Story.ObserveVariable`.

#### atrament.ink.goTo(ref)

Go to specified Ink knot or stitch. Wrapper for `Story.ChoosePathString`.

#### atrament.ink.getScene()

Returns **Scene** object.

### Settings methods

Application settings for your application. Loading, saving, and setting values changes `settings` section of Atrament state.

However, if you need to perform additional actions when setting is changed, you can define handler for it - see below. By default, Atrament handles `mute` and `volume` settings this way, muting and setting sound volume respectively.

#### async atrament.settings.load()

Load settings from persistent storage to Atrament state.

#### async atrament.settings.save()

Save settings from persistent storage.

#### atrament.settings.get(parameter)

Returns value of setting.

#### atrament.settings.set(parameter, value)

Sets value of setting.

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
  choices: [] 
}
```

| Key | Description                |
| :-------- | :------------------------- |
| `content` | Array of Ink paragraphs: `{text: '', tags: {}}` |
| `text` | Array of Ink paragraphs |
| `tags` | All tags from all paragraphs of this scene |
| `choices` | Array of choice objects: `{ id: 0, choice: 'Choice Text', tags: []}` |


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

Implements async function `load` to load content of Ink file. Takes full path as a parameter.

```
{
    async load(uri)
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
  playMusic(musicFile)
  stopMusic(musicFile|undefined)
}
```

## LICENSE

Atrament is distributed under MIT license.
Copyright (c) 2023 Serhii "techniX" Mozhaiskyi

