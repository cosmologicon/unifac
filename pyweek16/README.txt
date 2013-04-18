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

Command-line options
--------------------


How to Play the Game
--------------------


Controls
--------


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

The image "Sci-fi Girl" is by ElephantWindigo, available under a CC-BY-NC license here:
http://elephantwendigo.deviantart.com/art/Sci-fi-girl-332007060

The image "Vegetal Creature" is by Julie ann Lcok, availe under a CC-BY-NC-SA license here:
http://www.elfwood.com/~jlock3/Vegetal-Creature-(Original-Version).2855238.html



