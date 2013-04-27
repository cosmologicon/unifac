
# This module is a glorious hack. It enqueues updates on the server side to be sent to the
#   client. This module can be included by everything and use the module-level globals here,
#   to avoid having to pass around a bunch of stuff into all the objects' update methods.

# Seriously, it doesn't look like a lot, but this is going to make the rest of my code *much*
#   cleaner.

