
stack = []

def top():
	return stack[-1] if stack else None

def push(newscene):
	stack.append(newscene)

def pop():
	return stack.pop() if stack else None

def swap(newscene):
	oldscene = pop()
	push(newscene)
	return oldscene




