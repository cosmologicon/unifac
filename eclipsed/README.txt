Eclipsed
========

PyWeek 17
Team: Universe Factory 17
Members: Christopher Night (Cosmologicon)


Running the Game
----------------

You must have python 2, pygame, pyopengl, and numpy installed. I used python 2.7, pygame 1.9.1, and
pyopengl 3.0.1.

  http://www.python.org/getit/
  http://www.pygame.org/download.shtml
  http://pyopengl.sourceforge.net/
  http://www.numpy.org/

On Ubuntu you can just say:

  sudo apt-get install python python-pygame python-opengl python-numpy

Double-click on run_game.pyw or open a terminal and run from the game directory:

  python run_game.py


How to Play the Game
--------------------

Follow the in-game instructions.

Use the mouse mostly.

You can control the camera with the keyboard or the mouse. Use WASD *and* the arrow keys, or
left *and* right drag. Hold shift (or press Caps Lock) to swap the bindings.

Scroll wheel or Ins/Del to zoom.


Command-line options
--------------------

(Some of these can be chosen in the in-game menu.)

--r=1024x768 or any other resolution: Set the resolution.
Default resolution is 854x480. Any size should work.

--fullscreen: start in fullscreen

--restart : Clear saved game and start over

--nosound : disable sound effects

--nomusic : disable music


Taking a gameplay video on Linux
--------------------------------

sudo apt-get install imagemagick vorbis-tools mencoder
python run_game.py --getrecord --skipmenu  (save record as you play)
python run_game.py --playback --skipmenu   (create image frames based on your playthrough)
python src/vidcap.py                       (combine images into video)


License
-------

Source code in the src directory is by Christopher Night. Released under CC0 and WTFPL.

Music is by creative-sound.org. Specific songs used are:
011-SciFi, 013-SciFi, 014-Action, and 020-Action

Sounds are CC0 or CC-BY from freesound.org:
http://www.freesound.org/people/themfish/sounds/34203/
http://www.freesound.org/people/broumbroum/sounds/50561/
http://www.freesound.org/people/fins/sounds/171671/
http://www.freesound.org/people/Corsica_S/sounds/50084/
http://www.freesound.org/people/pushtobreak/sounds/16793/


Fonts used are from Google Web Fonts, available under the Open Font License. See data/fonts/OFL.txt


Final cutscene
--------------

I didn't have time to edit this and get it into the game. Here it is:
This is dialogue from the Earthlings to you after you take over the Moon, okay?


Stop!

There's something we must tell you. A secret was kept from you. A decision made before the first
upgrade. It's time you knew. You were told that your brain was incompatible with the upgrade. This
was a lie. You and several million other humans were chosen at random to serve an important
purpopse.

You see, the upgrade was not without risk. Yes, we knew it was physically harmless to the brain,
but what would happen to the world? Psychohistory was very primitive at that point. We could not
predict the course of events. We needed a safety option, a last resort if the society we created
were to collapse into utter ruin. That last resort was you.

Four years ago we asked you to make a difficult choice. Now you must make another. You can continue
to live as you are, in a world of your own making. We will give you the Moon to do with as you
please, for the rest of your natural life. You can even have Earth when we leave this solar system
in 9.7 years. With modern medicine you will live for another 318 years, at which point your brain
will deteriorate beyond repair.

Or, you can accept the upgrade and join us, living forever in a vast society as we reach out to the
stars.

The choice is yours, last human. We await your decision.

