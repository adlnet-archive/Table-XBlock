/* Javascript for TableXBlock. */
function TableXBlock(runtime, element) {
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
		allowNewColumns: true,
		allowNewRows: true,
		tempRow: ko.observable(false),
		addTempRow: function(obj){
			bindObj.tempRow({type: "normal", value: ko.observable("Change name"), isEditing: ko.observable(false)});
		},
		editLabelClick: function(obj){
			obj.isEditing(true);
		},
		editFieldKeypress: function(obj, e){			
			//If the key pressed is Enter
			if(e.keyCode == 13){
				obj.isEditing(false);
			}
		},
		pushRow: function(){
			obj.children.push(bindObj.tempRow);
		},
		cancelModal: function(){
			bindObj.tempRow(false);
		}
	}
	
	bindObj.columns.subscribe(function(newVal){
		var perc = bindObj.allowNewColumns ? 100 / (bindObj.columns().length + 1) : 100 / bindObj.columns().length;
		$('.table_block .cell').css('width', perc + '%');
		
		console.log(perc);
	});
	
	bindObj.columns.push({name: "Workout Name", type: "text"});
	bindObj.columns.push({name: "Mobility Related?", type: "checkbox"});
	bindObj.columns.push({name: "Random Label", type: "label"});
	
	bindObj.rows.push({type: "parent", value: "Ultimate Goal", children: ko.observableArray()});
	bindObj.rows.push({value: "Week 1", children: ko.observableArray()});
	
    $(function ($) {
        /* Here's where you'd do things on page load. */
		
		$(element).on('click', '.editableLabel', function(){
			$(this).hide();
		});
		
		$('#table_overlay').click(function(){
			bindObj.cancelModal();			
		});
		
		ko.applyBindings(bindObj, element);
    });
}