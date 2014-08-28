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
		}
	}

	bindObj.columns.push({name: "Workout", type: "text"});
	bindObj.columns.push({name: "col2", type: "checkbox"});
	bindObj.columns.push({name: "col3", type: "label"});
	bindObj.rows.push({type: "parent", value: "Ultimate Goal", children: []});
	bindObj.rows.push({type: "normal", value: "Week 1", children: []});
	
    $(function ($) {
        /* Here's where you'd do things on page load. */
		
		ko.applyBindings(bindObj, element);
    });
}