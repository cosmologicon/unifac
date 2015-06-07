import cgi, sys
import recordsdb

sys.stderr = sys.stdout
form = cgi.FieldStorage()
form = { field: form.getfirst(field) for field in form }
act = form["act"] if "act" in form else ""
print("Content-type: text/plain\n")
print(form.keys())
if act == "addrecords":
	fields = recordsdb.extractfields(form)
	recordsdb.validatefields(fields)
	recordsdb.addrecords(fields)

