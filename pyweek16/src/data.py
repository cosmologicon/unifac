import os.path

def filepath(*fpath):
	return os.path.join(*((os.path.dirname(__file__), "..", "data") + fpath))


