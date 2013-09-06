
stack = []

def top():
	return stack[-1] if stack else None

def push(newscene):
	stack.append(newscene)
	newscene.init()

def pop():
	s = stack.pop() if stack else None
	if top():
		top().resume()
	return s

def swap(newscene):
	oldscene = pop()
	push(newscene)
	return oldscene




