"""TO-DO: Write a description of what this XBlock is."""

import pkg_resources
import json

from xblock.core import XBlock
from xblock.fields import Scope, Integer, String, Dict, List, UserScope, BlockScope
from xblock.fragment import Fragment
from random import randint


class TableXBlock(XBlock):
	"""
	TO-DO: document what your XBlock does.
	"""

	# Fields are defined on the class.  You can access them in your code as
	# self.<fieldname>.
	
	_cell = '''<div class="cell" data-bind="style: { width: $root.getCellWidth() }">
				<!-- ko if: $data.type == "label" -->
					<span data-bind="text: $parent.values()[$index()].v() ? $parent.values()[$index()].v() : placeholder"></span>
				<!-- /ko -->
				
				<!-- ko if: $data.type == "text" || $data.type == "number" -->
					<span class="editable" data-bind="text: $parent.values()[$index()].v() ? $parent.values()[$index()].v() : placeholder, visible: !$parent.values()[$index()].isEditing(), click: function(){$root.editLabelClick($parent.values()[$index()])}"></span>
					<input data-bind="value: $parent.values()[$index()].v, attr: {type:type,placeholder: placeholder}, visible: $parent.values()[$index()].isEditing, hasFocus: $parent.values()[$index()].isEditing, event: {keyup: function(o, e){$root.editFieldKeypress($parent, e)}}" />
				<!-- /ko -->
				
				<!-- ko if: $data.type == "textarea" -->
					<span class="editable" data-bind="text: $parent.values()[$index()].v() ? $parent.values()[$index()].v() : placeholder, visible: !$parent.values()[$index()].isEditing(), click: function(){$root.editLabelClick($parent.values()[$index()])}"></span>
					<textarea data-bind="value: $parent.values()[$index()].v, attr: {placeholder: placeholder}, visible: $parent.values()[$index()].isEditing, hasFocus: $parent.values()[$index()].isEditing, event: {keyup: function(o, e){$root.editFieldKeypress($parent, e)}}" />
				<!-- /ko -->
				
				<!-- ko if: $data.type == "checkbox" -->
					<input type="checkbox" data-bind="checked: $parent.values()[$index()].v" />
				<!-- /ko -->
				
				<!-- ko if: $data.type && $data.type.match(/button/gi) -->
					<button data-bind="text: placeholder, click: $root.handleButtonClick($parent, $index()), disable: $data.type == 'xAPI onetimeButton' && $parent.values()[$index()].v()"></button>
				<!-- /ko -->
			</div>'''	
			
	tableStructure = Dict(default={"Table": {}}, scope=Scope.content, help="Options that will determine the table structure presented to users")
	showColumns = List(default=[], scope=Scope.content, help="The list of columns to show for this instance of Table")
	userRows = Dict(default={}, scope=Scope.preferences, help="User row preferences")
	currentStructure = String(default="Table", scope=Scope.content, help="Key representing current structure")
	display_name = String(display_name="Table XBlock", default="Table XBlock", scope=Scope.settings, help="Name of the component in the edxplatform")
	
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
		frag.add_javascript(self.resource_string("static/js/lib/xapiwrapper.min.js"))
		frag.add_javascript(self.resource_string("static/js/lib/knockout-3.1.0.js"))
		frag.add_javascript(self.resource_string("static/js/lib/knockout.mapping-latest.debug.js"))
		
		randNum = str(randint(0, 10000))
		
		js = self.resource_string("static/js/src/table.js")
		tab = self.tableStructure
		showColumns = self.showColumns
		userRows = self.userRows
		
		jsStr = js.replace('{{tableStructure}}', json.dumps(tab))
		jsStr = jsStr.replace('{{showColumns}}', json.dumps(showColumns))
		jsStr = jsStr.replace('{{userRows}}', json.dumps(userRows))
		jsStr = jsStr.replace('{{display_name}}', self.display_name)
		jsStr = jsStr.replace('{{randFuncName}}', randNum)
		jsStr = jsStr.replace('{{currentStructure}}', self.currentStructure)
		
		frag.add_javascript(jsStr)
		frag.initialize_js('TableXBlock' + randNum)
		return frag
		
	# TO-DO: change this view to display your data your own way.
	def studio_view(self, context=None):
		html = self.resource_string("static/html/table_edit.html")
		frag = Fragment(html)
		
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
		
		self.display_name = data['displayName']
		self.tableStructure = data['tableStructure']
		self.showColumns = data['showColumns']
		self.currentStructure = data['currentStructure']
		return data
		
	@XBlock.json_handler
	def save_student_rows(self, data, suffix=''):
		"""
		An example handler, which increments the data.
		"""
		# Just to show data coming in...
		#assert data['hello'] == 'world'

		self.userRows = data
		return data
		
	@XBlock.json_handler
	def track_data(self, data, suffix=''):
		"""
		An example handler, which increments the data.
		"""
		# Just to show data coming in...
		#assert data['hello'] == 'world'
		self.runtime.publish(self, 'prt_complete', data)
		return data

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
