# class Atrament

Instantiates Atrament object. Exposes Ink story as 'story' property.

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
* `saveGame`: called when game state is saved. Handler function receives object `{id: 'save id', data: saveDataObj}` and should return a Promise which resolves when game is saved.
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
atrament.registerCommand('CLEAR', (params, story) => { story.clearEpisode(); });
```
Register Ink command. Commands in Ink are written as `>>> COMMAND` and can have parameters (`>>> IMG gfx/intro.png`). You can use 'story' object in your callback.

```
atrament.startGame();
```
Start game from first episode. Returns a Promise.

```
const scene = atrament.renderScene();
```
Render new scene. Commands are executed at this stage.

```
atrament.story.getCurrentScene();
```
Get content of current scene.

```
atrament.story.getCurrentEpisode();
```
Get current episode (array of all available scenes).

```
atrament.makeChoice(choiceId);
```
Make choice with give ID.

```
atrament.saveGame(slotId);
```
Emits `saveGame` event with given slot ID. Returns a Promise.

```
atrament.loadGame(slotId);
```
Emits `loadGame` event with given slot ID, returns a Promise. Should be used instead of `startGame` when you load a game.

```
atrament.getTranscript();
```
Get transcript output.


# class AtramentStory

Initialises Story object, exposes it as `$ink` property.


