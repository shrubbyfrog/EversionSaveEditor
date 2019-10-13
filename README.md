# Eversion Web Save Editor
A web-based save editor for Eversion (freeware) and Eversion HD.

This save editor is written in a mixture of Javascript and jQuery and runs directly within the browser. It is compatible with both the freeware versions of Eversion as well as Eversion HD. The script was adapted and optimized by [tornado-ii](https://github.com/tornado-ii) (Hybrid-Dragon).

http://frog.angel-island.zone/eversion/save-editor/

# Usage
1. Select your **save.sav** file and load it into the program.
   * For any non-Steam version of the game, this will be located in the root directory of your Eversion game folder.
   * For the Steam version of the game, navigate to Eversion in your game library, right click and select `Properties`, click on the `Local Files` tab, and select `Browse Local Files`.
2. Select or deselect options as desired.
   * **Certain options may not be available depending on your version of the game.**
3. Save and overwrite your pre-existing **save.sav** file.
   * **The game must be closed before replacing the file.**
4. Enjoy!

## empty.sav
The **empty.sav** file is required for the game to be able to initialize a new save.sav file should one be unreadable or missing. If there is no empty.sav file and a save.sav file cannot be read, the game will crash on runtime.

Provided with the program is a clean empty.sav file that works with any version of the game. If your empty.sav file is missing or unreadable, simply save the provided empty.sav file in the root of the Eversion game folder.
