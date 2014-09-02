/* Javascript for TableXBlock. */
function TableXBlock(runtime, element) {

    function updateCount(result) {
        $('.count', element).text(result.count);
    }

    var handlerUrl = runtime.handlerUrl(element, 'increment_count');

    /*$('p', element).click(function(eventObject) {
        $.ajax({
            type: "POST",
            url: handlerUrl,
            data: JSON.stringify({"hello": "world"}),
            success: updateCount
        });
    });*/
	
	var bindObj = {
		columns: ko.observableArray(),
		rows: ko.observableArray(),
		columnTypes: ["text", "textarea", "checkbox", "checkboxHighlight", "label"],
		rowTypes: ["normal", "parent", "appendable", "parentAppendable"],
		allowNewColumns: ko.observable(false),
		allowNewRows: ko.observable(true),
		addRow: function(obj){
			console.log(obj);
		},
		editLabelClick: function(obj){
			console.log(obj);
			obj.isEditing(true);
			//debugger;
		},
		editFieldKeypress: function(obj, e){
			console.log(obj);
			
			if(e.keyCode == 13){
				obj.isEditing(false);
			}
			//obj.isEditing(true);
		},
	}

	bindObj.columns.push({name: "Workout", type: "text"});
	bindObj.columns.push({name: "Checkboxes", type: "checkbox"});
	bindObj.columns.push({name: "Labels", type: "label"});
	
	bindObj.rows.push({type: "parent", value: "Ultimate Goal", children: []});
	bindObj.rows.push({value: "Week 1", children: []});
	
	bindObj.rows.push({type: "normal", value: ko.observable("Week 1"), children: [], isEditing: ko.observable(false)});
	
    $(function ($) {
        /* Here's where you'd do things on page load. */
		
		$(element).on('click', '.editableLabel', function(){
			$(this).hide();
		});
		ko.applyBindings(bindObj, element);
    });
}