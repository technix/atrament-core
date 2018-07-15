# Atrament

*Atrament: (obsolete) ink*

Text adventure engine, based on Inkjs.

## Methods

```
import Atrament from 'atrament';
const atrament = new Atrament(gameConfig);
```
Initialize Atrament with game configuration.

```
atrament.on(event, handlerFunction);
```
Add event handler. Currently, the following events are available:
* `loadStory`: called when ink.json story file is loaded. Handler function should return a Promise which returns file content at resolve.
* `saveGame`: called when game state is saved. Handler function receives object `{id: 'save id', data: saveDataObj}` and should return Promise which resolves when game is saved.
* `loadGame`: called when game state is loaded. Handler function should return a Promise which returns saved data as string.
* `error`: called when error happens.

```
atrament.registerObservers(observersList);
```
Register observers for variables. Format for observersList: `{variableName: handlerFunction, ...}`. Handler function takes two parameter - variable name and it's value.

```
atrament.registerFunctions(functionsList);
```
Register functions exposed to Ink story. Format for functionsList: `{functionName: handlerFunction, ...}`.

```
atrament.registerCommand('CLEAR', (params, episode) => { episode.clear(); }, ['episode'] );
```
Register Ink command. Commands in Ink are written as `>>> COMMAND` and can have parameters (`>>> IMG gfx/intro.png`). You can use 'episode' and 'scene' objects in your callback. To do so, you have to list them in dependencies array (last parameter to registerCommand)

```
atrament.startGame();
```
Start game from first episode.

```
atrament.renderScene();
```
Render new scene. Commands are executed at this stage.

```
atrament.getCurrentScene();
```
Get content of current scene.

```
atrament.getCurrentEpisode();
```
Get current episode (array of all available scenes).

```
atrament.makeChoice(choiceId);
```
Make choice with give ID.

```
atrament.saveGame(slotId);
```
Emits `saveGame` event with given slot ID.

```
atrament.loadGame(slotId);
```
Emits `loadGame` event with given slot ID. Should be used instead of `startGame` when you load a game.

```
atrament.getTranscript();
```
Get transcript output.


## TODO
- [ ] Checkpoints
- [ ] Navigation between checkpoints
- [ ] Multiple .ink as one game
- [ ] ink function for switching episodes
- [x] Transcript
- [ ] Unit test framework
- [ ] Plugins - sound, localstorage etc.

## LICENSE
Atrament is distributed under MIT license.
Copyright (c) 2018 Serhii "techniX" Mozhaiskyi

inkjs is copyright (c) 2017 Yannick Lohse
Ink is copyright (c) 2017 inkle Ltd.