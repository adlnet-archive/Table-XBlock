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
		columnTypes: ["text", "textarea", "checkbox", "checkboxHighlight"],
		rowTypes: ["normal", "parent", "appendable", "parentAppendable"],
		allowNewColumns: ko.observable(false),
		allowNewRows: ko.observable(true),
	}

	bindObj.columns.push({name: "col1"});
	bindObj.columns.push({name: "col2"});
	bindObj.columns.push({name: "col3"});
	bindObj.rows.push({type: "normal"});
	bindObj.rows.push({type: "parent"});
	bindObj.rows.push({type: "normal"});
	
    $(function ($) {
        /* Here's where you'd do things on page load. */
		
		ko.applyBindings(bindObj, element);
    });
}