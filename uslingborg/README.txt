Uslingborg Defense
==================

Made in one week for PyWeek #14  <http://www.pyweek.org/14/>
URL: http://pyweek.org/e/unifac14/
Team: Universe Factory
Members: Christopher Night (Cosmologicon)
License: artwork, sound, and code are CC0/WTFPL. Fonts and final song, see below


Running the Game
----------------

Requires pygame. Tested on python 2.6.5 and pygame 1.9.1 on Ubuntu.

On Windows or Mac OS X, locate the "run_game.pyw" file and double-click it.

Othewise open a terminal / console and "cd" to the game directory and run:

  python run_game.py

Command line options:

  python run_game.py --doubletime     game runs at 2x speed
  python run_game.py --noanimals      if you don't want to have to kill dogs and horses


Controls
--------

To switch between map view and invention table view, press Tab or click on the other view in the
upper-right corner.

On the invention table:
Click on any box, or point to it and press a key, to assign that button or key to that invention.
Click and drag the blue boxes on the right and bottom of the table to rearrange the table (this
costs money).

On the map:
Click, or point and press a key, to deploy the corresponding invention. If you hold the key or
button, you can see what areas are available to deploy.

F1-F5: level select
F10: restart current level
F11: beat current level
F12: screenshot


Detailed instructions
---------------------

This is a tower defense game where you're defending the evil Castle Uslingborg from an angry mob of
villagers, by deploying diabolical inventions. The inventions are listed in a table, which grows
from level to level. Switch between the map and the invention table by pressing Tab, or clicking on
the window in the upper-right.

On the invention table, you can assign keys and mouse clicks to your available inventions. Each of
the squares is a different invention. Point to a square with the mouse, and click your left, middle,
or right mouse button, or press a key. Now return to the gameplay area (press Tab) and you can
deploy this invention using the button or key you assigned. Hold down the button to see available
areas to deploy it.

You can sort your invention table, to decide which inventions will be cheaper than others. Click and
drag the blue boxes on the right side and bottom of the table. The inventions in the upper-left are
the cheapest at 30gp, and the inventions in the lower-right are the most expensive, costing an extra
10gp for every cell over or down. It costs 20gp to sort the table.

The game is not very well balanced. You can easily beat it without using most of the inventions in
the table. So I encourage you to try them out! The game's not very hard. You can use F1 through F5
to skip between levels if you like.


Invention Descriptions
----------------------

It's not really that necessary to strategize in this game, but if you want to, read what each of
the inventions do here:

SPIRE: A basic tower that takes up a lot of space and has a long range.

MONKEY: An evil flying monkey. Charges up twice as fast as a spire. Small range.

SHARK: The only invention that can be placed in the water. Charges at same rate as spire. Medium
range.

CORPSE: Can only be placed in a graveyard (gray zone). Charges up twice as fast as a spire. Medium
range.

GLYPH: Circle drawn onto the ground. Limited range (only hits objects within the circle), but can
hit multiple objects at once. Charges 50% slower than a spire.

Each invention also does a certain kind of damage:

LASER: Basic strong weapon.

FREEZE: Causes no damage but encases the target in a block of ice. Freeze weapons charge up very
fast.

FLAME: Causes damage and makes the thing run around in a circle for a few seconds. Less damage than
lasers (3 hits to kill a villager rather than 2).

ATOMIC: Turns the target into a ticking time bomb, which can also take out other targets. You don't
collect any money for targets that are turned into bombs.


Asset License
-------------

"Lame Monster Party" by Paul and Storm is distributed under CC-BY-NC-SA and can be purchased here:
http://www.paulandstorm.com/lyrics/lame-monster-party/

Fonts used in the game are from Google Web Fonts. The corresponding licenses are found in the
subdirectory of the data directory, along with the font itself.

Other songs and sound effects were made with Autotracker-BU and a3sfxr. They're CC0/WTFPL, as are
all code and graphics.



