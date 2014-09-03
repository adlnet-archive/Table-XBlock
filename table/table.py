"""TO-DO: Write a description of what this XBlock is."""

import pkg_resources

from xblock.core import XBlock
from xblock.fields import Scope, Integer
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
					<span data-bind="text: $parent.value, visible: !$parent.isEditing(), click: function(){$root.editLabelClick($parent)}"></span>
					<input type="text" data-bind="value: $parent.value, attr: {placeholder: name}, visible: $parent.isEditing, hasFocus: $parent.isEditing, event: {keyup: function(o, e){$root.editFieldKeypress($parent, e)}}" />
				<!-- /ko -->
				
				<!-- ko if: $data.type && $data.type.match(/checkbox/gi) -->
					<input type="checkbox" />
				<!-- /ko -->
			</div>'''	

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
        frag.add_javascript(self.resource_string("static/js/src/table.js"))
        frag.initialize_js('TableXBlock')
        return frag

    # TO-DO: change this handler to perform your own actions.  You may need more
    # than one handler, or you may not need any handlers at all.
    @XBlock.json_handler
    def increment_count(self, data, suffix=''):
        """
        An example handler, which increments the data.
        """
        # Just to show data coming in...
        assert data['hello'] == 'world'

        self.count += 1
        return {"count": self.count}

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