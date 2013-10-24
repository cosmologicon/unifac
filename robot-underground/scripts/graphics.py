import svg
from collections import defaultdict


METALS = ["Cobalt", "Zinc", "Molybdenum", "Bismuth", "Technetium"]  # from constants
top, bottom, left, right, topleft, topright, bottomleft, bottomright = [2 ** x for x in range(8)]  # from world

cross = svg.SVG("../data/images/misc/cross.svgz")

drop = svg.AnimatedSVG(["../data/images/misc/atom1.svgz",
                        "../data/images/misc/atom2.svgz",
                        "../data/images/misc/atom3.svgz",
                        "../data/images/misc/atom4.svgz",
                        "../data/images/misc/atom5.svgz"], framelength=5)
                        
weapondrop = svg.AnimatedSVG(["../data/images/misc/crystal1.svgz",
                              "../data/images/misc/crystal2.svgz",
                              "../data/images/misc/crystal3.svgz",
                              "../data/images/misc/crystal4.svgz",], framelength=4)

anim_blade_drone = svg.AnimatedSVG(map(lambda x: "../data/images/enemies/blade%d.svgz" % (x), [1,2,3]), framelength=2)
anim_saw_drone_cw = svg.AnimatedSVG(map(lambda x: "../data/images/enemies/sawdrone%d.svgz" % (x), [1,3,2]), framelength=2)
anim_saw_drone_ccw = svg.AnimatedSVG(map(lambda x: "../data/images/enemies/sawdrone%d.svgz" % (x), [1,2,3]), framelength=2)
anim_spider = svg.AnimatedSVG(["../data/images/enemies/spider.svgz","../data/images/enemies/spidermove.svgz"], framelength=4)
anim_scorpion = svg.AnimatedSVG(map(lambda x: "../data/images/enemies/scorpion%d.svgz" % (x), [1,2,3,4]), framelength=4)
anim_bat = svg.AnimatedSVG(map(lambda x: "../data/images/enemies/bat%d.svgz" % (x), [1,2]), framelength=4)
anim_beetle = svg.AnimatedSVG(map(lambda x: "../data/images/enemies/stagbettle%d.svgz" % (x), [1,2]), framelength=4)
anim_copter = svg.AnimatedSVG(map(lambda x: "../data/images/enemies/heli%d.svgz" % (x), [1,2,3,4]), framelength=2)
anim_tank = svg.AnimatedSVG(map(lambda x: "../data/images/enemies/tank%d.svgz" % (x), [1,2]), framelength=5)
anim_drill_tank = svg.AnimatedSVG(map(lambda x: "../data/images/enemies/drilltank%d.svgz" % (x), [1,2]), framelength=4)
anim_pincer_tank = svg.AnimatedSVG(map(lambda x: "../data/images/enemies/pincertank%d.svgz" % (x), [1,2]), framelength=4)

anim_ninja_star = svg.AnimatedSVG(map(lambda x: "../data/images/shots/ninjastar%d.svgz" % (x), [1,2,3]), framelength=2)

splash = svg.SVG("../data/images/shots/splash.svgz")
leftclaw = svg.SVG("../data/images/shots/slash1.svgz")
rightclaw = svg.SVG("../data/images/shots/slash2.svgz")
trail = svg.SVG("../data/images/shots/trailcircle.svgz")

trails = {"fire": (1,1,0,1,0,0),
          "smoke": (1,1,1,0,0,0),
          "railgun": (0,1,1,0,0,1)}

camden_anims = {'static': svg.SVG("../data/images/robots/overcamden3.svgz"), 'walking': svg.AnimatedSVG(map(lambda x: "../data/images/robots/overcamden%d.svgz" % x, [1,3,2,3]), framelength=3)}

sprites = {
        "Camden": (svg.StatefulSVG(camden_anims), (.3,.6,1)),

        "Spike Drone": (svg.SVG("../data/images/enemies/spiky.svgz"), (0,1,0)),
        "Blade Drone": (anim_blade_drone, (0.2,1,0.2)),
        "Saw Drone": (anim_saw_drone_ccw, (0.4,1,0.4)),
        "Mini Saw Drone (Clockwise)": (anim_saw_drone_cw, (0.2,1,0.6)),
        "Mini Saw Drone (Counter-Clockwise)": (anim_saw_drone_ccw, (0.6,1,0.2)),
        "Justice Drone": (svg.SVG("../data/images/enemies/spiky.svgz"), (0.2,1,0.2)),
        "Injustice Drone": (anim_saw_drone_ccw, (0.5,1,0.5)),
        "Giant Blade Drone": (anim_blade_drone, (0.4,1,0.4)),
        "Ninja Drone": (anim_blade_drone, (0,0.6,0)),
        "Spider": (anim_spider, (1,0,1)),
        "Spider Queen": (anim_spider, (1,0,1)),
        "Arachne": (anim_spider, (1,0,1)),
        "Ninja Spider": (anim_spider, (.2,.2,.5)),
        "Moon Spider": (anim_spider, (1,1,0.7)),
        "Variety Spider R": (anim_spider, (1,0,0)),
        "Variety Spider Y": (anim_spider, (1,1,0)),
        "Variety Spider G": (anim_spider, (0,1,0)),
        "Variety Spider B": (anim_spider, (0,0,1)),
        "Flame Avatar": (anim_beetle, (1,0,0)),
        "Mini Tank": (anim_tank, (0,1,1)),
        "Red Tank": (anim_tank, (1,0,0)),
        "Machine Gun Tank": (anim_tank, (0.9,0.7,0.1)),
        "Heavy Tank": (anim_tank, (0,1,1)),
        "Drill Tank": (anim_drill_tank, (0.8,0.6,0.2)),
        "Pincer Tank": (anim_pincer_tank, (0.2,0.6,0.8)),
        "Railgun Tank": (anim_tank, (0,1,1)),
        "Rocket Tank": (anim_drill_tank, (0.8,0.6,0.2)),
        "Heavy Tank": (anim_drill_tank, (1,0.6,0.2)),
        "Terror Tank": (anim_pincer_tank, (1,0,0)),
        "Super Rocket Tank": (anim_tank, (1,1,0)),
        "Sentry Droid": (svg.SVG("../data/images/enemies/droid.svgz"), (1,1,0)),
        "Mech Droid": (svg.SVG("../data/images/enemies/mechdroid.svgz"), (0.8,0.8,0)),
        "Combat Droid Zero": (svg.SVG("../data/images/enemies/mechdroid.svgz"), (0.8,0.8,0)),
        "Assassin Droid": (svg.SVG("../data/images/enemies/mechdroid.svgz"), (0,0,0)),
        "Copter": (anim_copter, (1,0,0)),
        "Micro Copter": (anim_copter, (1,0.7,0)),
        "Support Copter": (anim_copter, (0.5,1,0)),
        "War Chopper": (anim_copter, (0.5,0.2,1)),
        "Scorpion": (anim_scorpion, (0.8,0.2,0)),
        "Fire Scorpion": (anim_scorpion, (1,0,0)),
        "Greater Fire Scorpion": (anim_scorpion, (1,0,0)),
        "Stag Beetle": (anim_beetle, (0.9,0.4,0)),
        "Jade Beetle": (anim_beetle, (0.4,1,0.7)),
        "Bat": (anim_bat, (0.4,0.4,0.4)),
        "Gatling Gun Turret Mk. I": (svg.TurretSVG(svg.SVG("../data/images/enemies/turretbase.svgz"), svg.SVG("../data/images/enemies/turretgg.svgz")), (.6,.3,1)),
        "Bazooka Turret Mk. I": (svg.TurretSVG(svg.SVG("../data/images/enemies/turretbase.svgz"), svg.SVG("../data/images/enemies/turretgun.svgz")), (1,.6,.3)),
        
        "Intimidating Scorpion": (anim_scorpion, (0.7,0,0)),
        "Monument": (svg.SVG("../data/images/scenery/column.svgz"), (1,0,1)),
        "Minument": (svg.SVG("../data/images/scenery/column.svgz"), (1,.3,1)),
        "Arsenal": (svg.SVG("../data/images/robots/overarsenal.svgz"), (.8, .8, .8)),
        "Hyde": (svg.SVG("../data/images/robots/overhyde.svgz"), (0.8,0.8,0.8)),
        "Chalfont/Latimer Fusion": (svg.SVG("../data/images/robots/overcnlcombine.svgz"), (.5,1,.5)),
        "St. Pancras": (svg.SVG("../data/images/robots/overstpancras.svgz"), (1,1,1)),
        "Robo-Cherub": (svg.SVG("../data/images/robots/cannon1.svgz"), (1,0.9,0.9)),
        "Robo-Seraph": (svg.SVG("../data/images/robots/cannon2.svgz"), (0.9,0.9,1)),
        
        "Harlesden": (svg.SVG("../data/images/robots/overharlesden.svgz"), (.8,.7,.6)),
        "Harlesden's Brother": (svg.SVG("../data/images/robots/overharlesden.svgz"), (1,0,0)),
        "Victoria": (svg.SVG("../data/images/robots/overvictoria.svgz"), (.7,0,1)),
        "Great Portland": (svg.SVG("../data/images/robots/overportland.svgz"), (.6, .3, 0)),
        "Angel": (svg.SVG("../data/images/robots/overangel.svgz"), (1,0.5,0.5)),
        "Putney": (svg.SVG("../data/images/robots/overputney.svgz"), (1,1,.5)),
        "Chalfont": (svg.SVG("../data/images/robots/overchalfont.svgz"), (.5,1,.5)),
        "Latimer": (svg.SVG("../data/images/robots/overlatimer.svgz"), (.5,1,.5)),
        "Hammersmith": (svg.SVG("../data/images/robots/overhammersmith.svgz"), (1,.3,0)),
        "Cutty Sark": (svg.SVG("../data/images/robots/overcuttysark.svgz"), (1,1,0)),
        "Canary Wharf": (svg.SVG("../data/images/robots/overcanarywharf.svgz"), (1,.5,.5)),
        "Prince Regent": (svg.SVG("../data/images/robots/overprinceregent.svgz"), (.3,.5,1)),
        "Robo-Pope Hornchurch 0x0D": (svg.SVG("../data/images/robots/overhornchurch.svgz"), (.8,0,1)),
        "Father Gospel": (svg.SVG("../data/images/robots/overgospel.svgz"), (1,1,1)),
        "Goldhawk": (svg.SVG("../data/images/robots/overgoldhawk.svgz"), (1,.8,0)),
        "Cockfosters": (svg.SVG("../data/images/robots/overcockfosters.svgz"), (.8,.7,.6)),
        "Marylebone": (svg.SVG("../data/images/robots/overmarylebone.svgz"), (.6,.7,.8)),
        "Pimlico": (svg.SVG("../data/images/robots/overpimlico.svgz"), (1, 0, .5)),
        
        METALS[0]: (drop, (0,1,1)),
        METALS[1]: (drop, (0,1,0)),
        METALS[2]: (drop, (1,1,0)),
        METALS[3]: (drop, (1,0,0)),
        METALS[4]: (drop, (1,1,1)),
        "DroppedEquipment": (weapondrop, (1,0,1)),
        
        "Fountain": (svg.SVG("../data/images/scenery/cog.svgz"), (1,1,1)),
        "Fountain Water": (svg.AnimatedSVG(map(lambda x: "../data/images/scenery/water%d.svgz" % (x), [1,2]), framelength=16), (.5, .8, 1)),
        "Barrel": (svg.SVG("../data/images/scenery/barrel.svgz"), (.8,.3,0)),
        "Bush": (svg.SVG("../data/images/scenery/bush.svgz"), (.4,1,.4)),
        "Tree 1": (svg.SVG("../data/images/scenery/tree.svgz"), (.2,1,.1)),
        "Tree 2": (svg.SVG("../data/images/scenery/tree2.svgz"), (.1,1,.2)),
        "Crates": (svg.SVG("../data/images/scenery/crates.svgz"), (.8,.3,0)),
        "Column": (svg.SVG("../data/images/scenery/column.svgz"), (1,1,1)),
        "Rock": (svg.SVG("../data/images/scenery/rock.svgz"), (.6,.6,.7)),
        "Campfire": (svg.SVG("../data/images/scenery/campfire.svgz"), (.8,.3,0)),

        "Blast Door": (svg.StatefulSVG({0: svg.SVG("../data/images/scenery/blastdoor.svgz"),
                                         1: svg.SVG("../data/images/scenery/blastdoor_open1.svgz"),
                                         2: svg.SVG("../data/images/scenery/blastdoor_open2.svgz"),
                                         3: svg.SVG("../data/images/scenery/blastdoor_open3.svgz")}), (.8,.8,0)),
        
        "Cannonball": (svg.SVG("../data/images/shots/rocket.svgz"), (1,1,1)),
        "Railgun Slug": (svg.SVG("../data/images/shots/rocket.svgz"), (0,1,1)),
        "Rocket": (svg.SVG("../data/images/shots/rocket.svgz"), (1,0,0)),
        "Fireball": (svg.SVG("../data/images/shots/fireball.svgz"), (1,0.5,0)),
        "Napalm": (svg.SVG("../data/images/shots/fireball.svgz"), (1,0.5,0)),
        "Plasma": (svg.SVG("../data/images/shots/plasma.svgz"), (0.6,1,0.8)),
        "Shell": (svg.SVG("../data/images/shots/shell.svgz"), (0.4,0.4,0.4)),
        "Cannonball": (svg.SVG("../data/images/shots/cannonball.svgz"), (0.4,0.4,0.4)),
        "Ninja Star": (anim_ninja_star, (0.6,0.6,0.6)),
        "Proximity Mine": (svg.SVG("../data/images/enemies/mine.svgz"), (1,.5,0)),
        "Timed Mine": (svg.SVG("../data/images/enemies/mine.svgz"), (1,0,.5)),
        "Fire Spider 0": (anim_spider, (1,0,0)),
        "Fire Spider 1": (anim_spider, (1,.5,0)),
        "Fire Spider 2": (anim_spider, (1,1,0)),
        "Explosion 0": (splash, (1,0,0)),
        "Explosion 1": (splash, (1,.5,0)),
        "Explosion 2": (splash, (1,1,0)),
}

weapon = svg.SVG("../data/images/weapons/lasercannon.svgz")
weapon_icons = {
        "Light Laser": svg.SVG("../data/images/weapons/laser.svgz"),
        "Heavy Laser": svg.SVG("../data/images/weapons/lasercannon.svgz"),
        "Uber Laser": svg.SVG("../data/images/weapons/uberlaser.svgz"),
        "Taser": svg.SVG("../data/images/weapons/tazer.svgz"),
        "Lightning Gun": svg.SVG("../data/images/weapons/electricitygun.svgz"),
        "Chain Lightning Gun": svg.SVG("../data/images/weapons/chainlightninggun.svgz"),
        "Plasma Gun": svg.SVG("../data/images/weapons/plasma.svgz"),
        "Machine Gun": svg.SVG("../data/images/weapons/machine.svgz"),
        "Shotgun": svg.SVG("../data/images/weapons/shotgun.svgz"),
        "Sniper Rifle": svg.SVG("../data/images/weapons/sniper.svgz"),
        "Cannon": svg.SVG("../data/images/weapons/cannon.svgz"),
        "Gatling Gun": svg.SVG("../data/images/weapons/gatlinggun.svgz"),
        "Railgun": svg.SVG("../data/images/weapons/railgun.svgz"),
        "Flamethrower": svg.SVG("../data/images/weapons/flamethrower.svgz"),
        "Incendiary Rifle": svg.SVG("../data/images/weapons/incendiaryrifle.svgz"),
        "Napalm Thrower": svg.SVG("../data/images/weapons/napalm.svgz"),
        "Bazooka": svg.SVG("../data/images/weapons/bazooka.svgz"),
        "Rocket Launcher": svg.SVG("../data/images/weapons/rocket.svgz"),
        "Spider Thrower": svg.SVG("../data/images/weapons/spidermg.svgz"),
        "Light Repair Kit": svg.SVG("../data/images/weapons/repair.svgz"),
        "Super Repair Kit": svg.SVG("../data/images/weapons/repair.svgz"),
        "Proximity Mine Layer": svg.SVG("../data/images/weapons/proximitymine.svgz"),
        "Timed Mine Layer": svg.SVG("../data/images/weapons/timemine.svgz"),
}
armour = svg.SVG("../data/images/weapons/defence.svgz")
armour_icons = {
        "Talisman": svg.SVG("../data/images/armour/talisman.svgz"),
        "Sunglasses": svg.SVG("../data/images/armour/sunglasses.svgz"),
        "Boots": svg.SVG("../data/images/armour/boots.svgz"),
        "Backpack": svg.SVG("../data/images/armour/backpack.svgz"),
        "Armlet": svg.SVG("../data/images/armour/armlet.svgz"),
        "Sandals": svg.SVG("../data/images/armour/sandals.svgz"),
        "Breastplate": svg.SVG("../data/images/armour/breastplate.svgz"),
        "Helmet": svg.SVG("../data/images/armour/helmet.svgz"),
}
        

eject = svg.SVG("../data/images/weapons/eject1.svgz")
eject_confirm = svg.SVG("../data/images/weapons/eject2.svgz")

cursors = {
        "walk": (svg.SVG("../data/images/cursors/arrows.svgz"), (1,1,0)),
        "fire": (svg.SVG("../data/images/cursors/crosshair.svgz"), (1,0,0)),
        "talk": (svg.SVG("../data/images/cursors/cursorfriend.svgz"), (0,1,0)),
        "inactive": (cross, (1,1,1)),
}

debug_iface_circle = svg.SVG("../data/images/cursors/perfectcircle.svgz")

portraits = {

        "Camden": ("Camden", svg.SVG("../data/images/robots/camden.svgz"), (.3,.6,1)),          # light blue
        "Harlesden": ("Harlesden", svg.SVG("../data/images/robots/harlesden.svgz"), (.8,.7,.6)), # pale
        "Harlesden cape": ("Harlesden", svg.SVG("../data/images/robots/wizardhatandcape.svgz"), (1,.9,.8)),
        "Victoria": ("Victoria", svg.SVG("../data/images/robots/victoria.svgz"), (.7,0,1)),                                 # magenta
        "Great Portland": ("Great Portland", svg.SVG("../data/images/robots/portland.svgz"), (.6,.3,0)), # rust
        "Angel": ("Angel", svg.SVG("../data/images/robots/angel.svgz"), (1,0.5,0.5)), #pink
        "Putney": ("Putney", svg.SVG("../data/images/robots/putney.svgz"), (1,1,.5)), #blue
        "Chalfont": ("Chalfont", svg.SVG("../data/images/robots/chalfont.svgz"), (.5,1,.5)),
        "Latimer": ("Latimer", svg.SVG("../data/images/robots/latimer.svgz"), (.5,1,.5)), #lime green
        "Chalfont &": ("Chalfont", svg.SVG("../data/images/robots/cnl.svgz"), (.5,1,.5)),
        "Latimer &": ("Latimer", svg.SVG("../data/images/robots/cnl.svgz"), (.5,1,.5)),
        "Chalfont & Latimer": ("Chalfont & Latimer", svg.SVG("../data/images/robots/cnl.svgz"), (.5,1,.5)),
        "Chalfont/Latimer Fusion": ("Chalfont/Latimer Fusion", svg.SVG("../data/images/robots/cnlcombine.svgz"), (.5,1,.5)),
        "Hammersmith": ("Hammersmith", svg.SVG("../data/images/robots/hammersmith.svgz"), (1,.3,0)),
        "Cutty Sark": ("Cutty Sark", svg.SVG("../data/images/robots/cuttysark.svgz"), (1.0, 1.0, 0.0)), # yellow
        "Canary Wharf": ("Canary Wharf", svg.SVG("../data/images/robots/canarywharf.svgz"), (1,.5,.5)), #pink
        "Regent": ("Prince Regent", svg.SVG("../data/images/robots/princeregent.svgz"), (.3,.5,1)), # royal blue
        "Hornchurch": ("Robo-Pope Hornchurch 0x0D", svg.SVG("../data/images/robots/hornchurch.svgz"), (.8,0,.1)), #wine
        "Gospel": ("Father Gospel", svg.SVG("../data/images/robots/gospel.svgz"), (1,1,1)), # white
        "Goldhawk": ("Goldhawk", svg.SVG("../data/images/robots/goldhawk.svgz"), (1,.8,0)), # gold
        "Monument Asleep": ("Monument", svg.SVG("../data/images/robots/monumentsleep.svgz"), (1,0,1)),
        "Monument Awake": ("Monument", svg.SVG("../data/images/robots/monumenttalk.svgz"), (1,0,1)),
        "Cockfosters": ("Cockfosters", svg.SVG("../data/images/robots/cockfosters.svgz"), (.8,.7,.6)),
        "Marylebone": ("Marylebone", svg.SVG("../data/images/robots/marylebone.svgz"), (.6,.7,.8)),
        "Pimlico": ("Pimlico", svg.SVG("../data/images/robots/pimlico.svgz"), (1, 0, .5)),
        "Arsenal": ("Arsenal", svg.SVG("../data/images/robots/arsenal.svgz"), (.8, .8, .8)),
        "Hyde": ("Hyde", svg.SVG("../data/images/robots/hyde.svgz"), (.8, .8, .8)),
        "Pancras happy": ("St. Pancras", svg.SVG("../data/images/robots/stpancras1.svgz"), (1,1,1)),
        "Pancras angry": ("St. Pancras", svg.SVG("../data/images/robots/stpancras2.svgz"), (1,1,1)),
}



world_colors = {
        'town': ((1,.9,.8), (.2,.1,0)),
        'cave': ((.8,.8,.6), (.4,.4,.4)),
        'basic': ((1,1,1), (0,.1,.2))
}
wall = svg.SVG("../data/images/scenery/wall1.svgz")

walls = {
        top: svg.SVG("../data/images/scenery/wallup.svgz"),
        bottom: svg.SVG("../data/images/scenery/walldown.svgz"),
        left: svg.SVG("../data/images/scenery/wallleft.svgz"),
        right: svg.SVG("../data/images/scenery/wallright.svgz"),
        
        top + bottom: svg.SVG("../data/images/scenery/equals.svgz"),
        left + right: svg.SVG("../data/images/scenery/uprightequals.svgz"),
        
        left + top: svg.SVG("../data/images/scenery/cornertl.svgz"),
        right + top: svg.SVG("../data/images/scenery/cornertr.svgz"),
        left + bottom: svg.SVG("../data/images/scenery/cornerbl.svgz"),
        right + bottom: svg.SVG("../data/images/scenery/cornerbr.svgz"),
        
        top + left + bottom: svg.SVG("../data/images/scenery/deadright.svgz"),
        top + right + bottom: svg.SVG("../data/images/scenery/deadleft.svgz"),
        top + left + right: svg.SVG("../data/images/scenery/deaddown.svgz"),
        right + left + bottom: svg.SVG("../data/images/scenery/deadup.svgz"),
        
        topleft: svg.SVG("../data/images/scenery/cornerpieceul.svgz"),
        topright: svg.SVG("../data/images/scenery/cornerpieceur.svgz"),
        bottomleft: svg.SVG("../data/images/scenery/cornerpiecedl.svgz"),
        bottomright: svg.SVG("../data/images/scenery/cornerpiecedr.svgz"),
        
        topleft + topright: svg.SVG("../data/images/scenery/dblcornertop.svgz"),
        topright + bottomright: svg.SVG("../data/images/scenery/dblcornerright.svgz"),
        bottomleft + bottomright: svg.SVG("../data/images/scenery/dblcornerbottom.svgz"),
        bottomleft + topleft: svg.SVG("../data/images/scenery/dblcornerleft.svgz"),
        bottomleft + topright: svg.SVG("../data/images/scenery/dblcornerdiagright.svgz"),
        topleft + bottomright: svg.SVG("../data/images/scenery/dblcornerdiagleft.svgz"),
        
        left + bottomright: svg.SVG("../data/images/scenery/linecornrightdown.svgz"),
        left + topright: svg.SVG("../data/images/scenery/linecornrightup.svgz"),
        right + bottomleft: svg.SVG("../data/images/scenery/linecornleftdown.svgz"),
        right + topleft: svg.SVG("../data/images/scenery/linecornleftup.svgz"),
        top + bottomleft: svg.SVG("../data/images/scenery/linecorndownleft.svgz"),
        top + bottomright: svg.SVG("../data/images/scenery/linecorndownright.svgz"),
        bottom + topleft: svg.SVG("../data/images/scenery/linecornupleft.svgz"),
        bottom + topright: svg.SVG("../data/images/scenery/linecornupright.svgz"),
                
        left + bottomright + topright: svg.SVG("../data/images/scenery/linecornright.svgz"),
        top + bottomright + bottomleft: svg.SVG("../data/images/scenery/linecorndown.svgz"),
        right + topleft + bottomleft: svg.SVG("../data/images/scenery/linecornleft.svgz"),
        bottom + topleft + topright: svg.SVG("../data/images/scenery/linecornup.svgz"),
        
        left + top + bottomright: svg.SVG("../data/images/scenery/cornercornerbr.svgz"),
        right + top + bottomleft: svg.SVG("../data/images/scenery/cornercornerbl.svgz"),
        left + bottom + topright: svg.SVG("../data/images/scenery/cornercornertr.svgz"),
        right + bottom + topleft: svg.SVG("../data/images/scenery/cornercornertll.svgz"),
       
        topleft + topright + bottomleft: svg.SVG("../data/images/scenery/triplecornerdr.svgz"),
        topleft + topright + bottomright: svg.SVG("../data/images/scenery/triplecornerlr.svgz"),
        topleft + bottomright + bottomleft: svg.SVG("../data/images/scenery/triplecornerur.svgz"),
        bottomright + topright + bottomleft: svg.SVG("../data/images/scenery/triplecornerul.svgz"),
        
        topleft + topright + bottomleft + bottomright: svg.SVG("../data/images/scenery/quadcorner.svgz"),

		top + bottom + left + right: svg.SVG("../data/images/scenery/wall1.svgz"),


    }
walls = defaultdict(lambda: wall, walls)

floor = svg.SVG("../data/images/scenery/floor1.svgz")
triup = svg.SVG("../data/images/misc/triangleup.svgz")
tridown = svg.SVG("../data/images/misc/triangledown.svgz")
appraised = svg.SVG("../data/images/misc/appraised.svgz")
equipped = svg.SVG("../data/images/misc/equipped.svgz")
title = svg.SVG("../data/images/misc/title.svgz")
