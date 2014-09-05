/* Javascript for TableXBlock. */
window.bindObj, window.studioBindObj;
function TableXBlock(runtime, element) {
    var handlerUrl = runtime.handlerUrl(element, 'increment_count');
	console.log("Not studio!");
    /*$('p', element).click(function(eventObject) {
        $.ajax({
            type: "POST",
            url: handlerUrl,
            data: JSON.stringify({"hello": "world"}),
            success: updateCount
        });
    });*/
    
    // {{replaceMe}}
    debugger;
    
	var currentRow;
	bindObj = {
		columns: ko.observableArray(),
		rows: ko.observableArray(),
		columnTypes: ["text", "textarea", "checkbox", "checkboxHighlight", "label"],
		rowTypes: ["normal", "parent", "appendable", "parentAppendable"],
		allowNewColumns: true,
		allowNewRows: true,
		tempRow: ko.observable(false),
		addTempRow: function(obj){
			bindObj.tempRow({type: ko.observable("normal"), value: ko.observable(""), isEditing: ko.observable(false)});
			currentRow = obj;
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
			currentRow.children.push(bindObj.tempRow());
			bindObj.cancelModal();
		},
		cancelModal: function(){
			bindObj.tempRow(false);
		},
		addAppendableRow: function(obj){
			var currentArr = bindObj.rows();
			var i = bindObj.rows.indexOf(obj);
			var number = obj.value.match(/[0-9]+/);
			
			if(i > -1 && Array.isArray(number)){
				obj.type("parent");
				bindObj.rows(currentArr.slice(0, i + 1));
				bindObj.rows().push({type: ko.observable("parentAppendable"), value: obj.name + ' ' + (+number[0] + 1), name: obj.name, children: ko.observableArray()});
				Array.prototype.push.apply(bindObj.rows(), currentArr.slice(i + 1, currentArr.length));
				bindObj.rows.valueHasMutated();
				
				console.log(obj);
			}
			else console.log("Not found");
		}
	}
	
	bindObj.columns.subscribe(function(newVal){
		var perc = bindObj.allowNewColumns ? 100 / (bindObj.columns().length + 1) : 100 / bindObj.columns().length;
		$('.table_block .cell').not('#table_modal .cell').css('width', perc + '%');
		
		console.log(perc);
	});
	
	bindObj.columns.push({name: "Exercise Name", placeholder: "[Enter exercise name]", type: "text"});
	bindObj.columns.push({name: "Mobility Related?", type: "checkbox"});
	bindObj.columns.push({name: "Random Label", type: "label"});
	
	bindObj.rows.push({type: ko.observable("parent"), value: "Ultimate Goal", children: ko.observableArray()});
	bindObj.rows.push({type: ko.observable("parentAppendable"), value: "Week 1", name: 'Week', children: ko.observableArray()});
	
    //$(document).ready(function () {
        /* Here's where you'd do things on page load. */
		console.log("test");
		$(element).on('click', '.editableLabel', function(){
			$(this).hide();
		});
		//debugger;
		ko.applyBindings(bindObj, (element instanceof $ ? element[0] : element));
   // });
}
/* Javascript for studio view TableXBlock. */
function StudioTableXBlock(runtime, element) {
    console.log("Studio");
    var handlerUrl = runtime.handlerUrl(element, 'save_admin_settings');
    
    $(element).find('.save-button').bind('click', function(e) {
        
        e.stopPropagation();
        runtime.notify('cancel', {});
        
        var handlerUrl = runtime.handlerUrl(element, 'save_admin_settings');
        var outObj = JSON.stringify(ko.toJS(studioBindObj));

		$.ajax({
		  type: "POST",
		  url: handlerUrl,
		  data: outObj,
		  complete: function(res){
			  console.log("This is the response: ", res);
		  },
		  contentType: "application/json; charset=UTF-8",
		});
        
       
    });
    
    var currentRow;
	studioBindObj = {
		columns: ko.observableArray(),
		rows: ko.observableArray(),
		columnTypes: ["text", "textarea", "checkbox", "checkboxHighlight", "label"],
		rowTypes: ["normal", "parent", "appendable", "parentAppendable"],
		allowNewColumns: true,
		allowNewRows: true,
		addColumn: function(){
			studioBindObj.columns.push({name: ko.observable("[Column name]"), placeholder: ko.observable(""), type: ko.observable("text")});
		},
		addRow: function(){
			studioBindObj.rows.push({name: ko.observable("[Row name]"), type: ko.observable("normal")});
		}
	};
	

	ko.applyBindings(studioBindObj, (element instanceof $ ? element[0] : element));
}
