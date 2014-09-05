"""TO-DO: Write a description of what this XBlock is."""

import pkg_resources

from xblock.core import XBlock
from xblock.fields import Scope, Integer, String
from xblock.fragment import Fragment


class TableXBlock(XBlock):
	"""
	TO-DO: document what your XBlock does.
	"""

	# Fields are defined on the class.  You can access them in your code as
	# self.<fieldname>.
	
	_cell = '''<div class="cell">
				<!-- ko if: $data.type == "label" -->
					<span data-bind="text: name + ' col'"></span>
				<!-- /ko -->
				
				<!-- ko if: $data.type == "text" -->
					<span class="editable" data-bind="text: $parent.value() ? $parent.value() : placeholder, visible: !$parent.isEditing(), click: function(){$root.editLabelClick($parent)}"></span>
					<input type="text" data-bind="value: $parent.value, attr: {placeholder: placeholder}, visible: $parent.isEditing, hasFocus: $parent.isEditing, event: {keyup: function(o, e){$root.editFieldKeypress($parent, e)}}" />
				<!-- /ko -->
				
				<!-- ko if: $data.type && $data.type.match(/checkbox/gi) -->
					<input type="checkbox" />
				<!-- /ko -->
			</div>'''	
			
	tableStructure = String(default="fun test", scope=Scope.settings, help="Options that will determine the table structure presented to users")
	display_name = String(display_name="Display Name", default="Table XBlock", scope=Scope.settings, help="Name of the component in the edxplatform")

	# TO-DO: delete count, and define your own fields.
	count = Integer(
		default=0, scope=Scope.user_state,
		help="A simple counter, to show something happening",
	)

	def resource_string(self, path):
		"""Handy helper for getting resources from our kit."""
		data = pkg_resources.resource_string(__name__, path)
		return data.decode("utf8")

	# TO-DO: change this view to display your data your own way.
	def student_view(self, context=None):
		"""
		The primary view of the TableXBlock, shown to students
		when viewing courses.
		"""
		
		html = self.resource_string("static/html/table.html")
		frag = Fragment(html.format(self=self))
		frag.add_css(self.resource_string("static/css/table.css"))
		frag.add_javascript(self.resource_string("static/js/lib/knockout-3.1.0.js"))
		frag.add_javascript(self.resource_string("static/js/lib/knockout.mapping-latest.debug.js"))
		
		js = self.resource_string("static/js/src/table.js")
		tab = self.tableStructure
		
		frag.add_javascript(js.replace('{{replaceMe}}', tab))
		frag.initialize_js('TableXBlock')
		return frag
		
	# TO-DO: change this view to display your data your own way.
	def studio_view(self, context=None):
		html = self.resource_string("static/html/table_edit.html")
		frag = Fragment(html.format(self=self))
		
		frag.initialize_js('StudioTableXBlock')
		return frag

	# TO-DO: change this handler to perform your own actions.  You may need more
	# than one handler, or you may not need any handlers at all.
	@XBlock.json_handler
	def save_admin_settings(self, data, suffix=''):
		"""
		An example handler, which increments the data.
		"""
		# Just to show data coming in...
		#assert data['hello'] == 'world'

		self.tableStructure = data
		return {"table": self.tableStructure}

	# TO-DO: change this to create the scenarios you'd like to see in the
	# workbench while developing your XBlock.
	@staticmethod
	def workbench_scenarios():
		"""A canned scenario for display in the workbench."""
		return [
			("TableXBlock",
			 """<vertical_demo>
				<table/>
				</vertical_demo>
			 """),
		]
