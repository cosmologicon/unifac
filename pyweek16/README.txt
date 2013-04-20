Game Name
=========

PyWeek 16
Team: Universe Factory 16
Members: Cosmologicon


Running the Game
----------------

You must have python 2 and pygame installed.

  http://www.python.org/getit/
  http://www.pygame.org/download.shtml

On Ubuntu you can just say:

  sudo apt-get install python python-pygame

Double-click on run_game.pyw or open a terminal and run from the game directory:

  python run_game.py


How to Play the Game
--------------------

Follow the in-game instructions.

Tiles are activated when all of their contacts are touching contacts of the opposite color.

Larger tiles may be unlocked, giving you rewards, by staying activated for long enough. Click on
a larger tile to begin unlocking it.

Defensive items may be unlocked and purchased by placing them on tiles.


Basic Controls
--------------

Left-click on tiles to rotate them left. Right-click to rotate right. Left click and drag to scroll.
Scroll wheel lets you zoom in and out.

Click on items in the sidebar to unlock them. Some items can be rotated before being placed.
Left-click to orient them correctly.

Esc to quit.


Advanced Controls
-----------------

Q/E: rotate the tile you're pointing to left/right. This is handy if you have an item selected.
WASD or arrows: scroll

keys to use the following item on the tile you're pointing to (after you've unlocked it):
1 or space: recolor contacts
2: barrier
3: laser
4: bidirectional laser
5: quad laser
6: blaster
7: mine
8: shrapnel mine
9: shield
0: directional shield

F12: screenshot


Command-line options
--------------------

-r=1024x768 or any other resolution: Set the resolution.
Default resolution is 854x480, don't make it smaller or else some of the text might be cut off.

--local : Play on a local server (which you can start with cd src ; python server.py)

--reset : Clear login information and start over

--nomusic : disable music

--bosscode=12345678 : see below


Final Boss Server
-----------------

When you unlock the final boss, you're given a code that lets you join a separate server where
the final battle occurs. This code will be saved in the file data/bosscode.txt. Anyone with the
code can join the battle. It's recommended you get someone to help you. If they have not yet
unlocked the final boss, you can share the code with them. Either give them a copy of bosscode.txt
and have them place it in their data directory, or have them start the game by saying:

   python run_game.py --bosscode=12345678

replacing 12345678 with the actual code.

During the final boss battle, all items are unlocked and you have unlimited Credits. You can't
use any special items you got on the main server.


License
-------

Source code in the src directory is by Christopher Night. Released under CC0 and WTFPL.

The library lib/websocket/websocket.py is used and distributed under the LGPL. Please see
lib/websocket/LICENSE.txt for details. You can get it here:
https://pypi.python.org/pypi/websocket-client/

The following songs are by Kevin MacLeod (incompetech.com), available under a CC-BY license:
Cephalopod
Ice Flow
Minima
Space 1990

The image "Sci-fi Girl" is by ElephantWindigo, available under a CC-BY-NC license here:
http://elephantwendigo.deviantart.com/art/Sci-fi-girl-332007060

The image "Vegetal Creature" is by Julie ann Lcok, availe under a CC-BY-NC-SA license here:
http://www.elfwood.com/~jlock3/Vegetal-Creature-(Original-Version).2855238.html

Fonts used are from Google Web Fonts, available under the Open Font License. See the
subdirectories of data/font for details.

