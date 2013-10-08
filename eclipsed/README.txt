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

Note that this process takes a long time to run. Best practice first with a 3-second clip.

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


