Hatchery
========

Warm-up game for PyWeek 16
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

You can specify any resolution you want with the -r flag like this:

  python run_game.py -r800x600

If you want to log in as a new user (reset your game), delete the login information:

  rm data/login.json


How to Play the Game
--------------------

You're a space stork that must deliver eggs from the hatchery to the correct colored worlds.

When you first land on a world, you find out what color it is. Explore the worlds by jumping
between them (up or space).

You can pick up an egg at the central hatchery or one of the satellite hatcheries (press down).

Every egg has several layers of eggshell. You must carry your egg to a world whose color matches
its outermost eggshell color. This will hatch that shell layer.

If you hatch every layer of eggshell, that's a successful delivery.

Eggs are fragile and can only survive 6 jumps. If you make 6 jumps without delivering the egg
successfully, the egg will shatter and you'll have to go get another.

Every successful delivery charges your talons. If you're jumping and you think you'll miss your
target, press jump to use a talon charge. This will land you on the nearest world to you.

Worlds that have never had a delivery from any stork are darker. If you deliver to one of these
worlds, you get a "First Delivery". This doesn't do anything, it's just for your score.


Controls
--------

Left/right: move across world surface
Up/space: jump. Also use talon charge
Down: Pick up egg for delivery (give it a second to appear). Must be on a hatchery (white world).
M: view map
Esc: quit

License
-------

Source code in the hatchery directory is by Christopher Night. Released under CC0 and WTFPL.

The library lib/websocket/websocket.py is used and distributed under the LGPL. Please see
lib/websocket/LICENSE.txt for details. You can get it here:
https://pypi.python.org/pypi/websocket-client/

The Google web font Skranji is available through an Open Font License. Please see data/OFL.txt.


