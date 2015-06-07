# Problem #

Twondy and Zoop is a platformer with tower defense elements. (Gameplay is about 75% platforming, 25% TD.) Platformers are played almost exclusively with the keyboard, and TD games are played almost exclusively with the mouse. Switching back and forth frequently is a pain. How should I let people select and place structures without the controls getting in the way?

# Potential Solutions #

## Full simultaneous control ##

The basic solution. You always have full control over the player character with the keyboard, and can place structures anywhere at any time with the mouse. This allows you the greatest control, but using the keyboard and mouse together can be difficult for casual gamers, people who like to use their right hand for the keys, and people using trackpads. Scrolling is an additional question: should you be able to scroll the screen with the mouse so you can build something far away from the player character, or should the camera always follow the player character?

## Player character as cursor ##

Player moves the character to where they want to place a tower, and click on a button to select which kind of tower to place. This method also allows for easy use of keyboard shortcuts, one for each kind of tower, so mouse control is optional. This is the current method.

## Pop-up construction menu ##

Similar to previous idea. Move the player character into place, then press the "build" key (say, space bar). A menu pops up asking what you want to build, and you choose something from the menu using arrow keys or mouse. Involves an extra action, but I think the player could get used to doing it rapidly.

## Mode switching ##

Game switches back and forth between platforming mode and TD mode. Maybe in TD mode the action is paused. The idea is to limit the number of times the player has to switch "contexts". For this to work, you would need to be given a bunch of resources all at once, so you're not switching back and forth constantly. For instance, you could get them at the beginning of the wave, so you can place all your towers at that point. The mode switch could either be automatic, or selected by the player.

## Platforming construction ##

All construction is done by having the player character manipulate objects, completely eliminating the need for mouse control. For instance, towers could be built by picking up seeds and carrying them to where you want the tower, then breaking open the seed by jumping on it. Could be a pain to have to carry a bunch of seeds back and forth.

## Uncontrolled construction ##

You don't get to decide what gets placed where. As you progress through the game, the towers place themselves at reasonably well-balanced locations.