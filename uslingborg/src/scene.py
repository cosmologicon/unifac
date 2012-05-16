
def push(scene):
    stack.append(scene)

def pop():
    stack.pop()

def top():
    return stack[-1] if stack else None

stack = []

