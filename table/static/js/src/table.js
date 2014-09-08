/* Javascript for TableXBlock. */
window.bindObj, window.studioBindObj;
function TableXBlock(runtime, element) {
    if(window.bindObj){
		console.log("Student view already generated");
		return;
	}

	var currentRow;
	var bindObj = window.bindObj = {
		columns: ko.observableArray(),
		rows: ko.observableArray(),
		columnTypes: ["text", "textarea", "checkbox", "checkboxHighlight", "label", "number"],
		rowTypes: ["normal", "parent", "appendable", "parentAppendable"],
		allowNewColumns: true,
		allowNewRows: true,
		tempRow: ko.observable(false),
		addTempRow: function(obj){
			var newRow = {type: ko.observable("normal"), value: ko.observable(""), values: ko.observableArray()};
			initRowValues(true, newRow);
			bindObj.tempRow(newRow);
			
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
			var number = obj.value().match(/[0-9]+/);
			
			if(i > -1 && Array.isArray(number)){
				obj.type("parent");
				bindObj.rows(currentArr.slice(0, i + 1));
				bindObj.rows().push({
					type: ko.observable("parentAppendable"), 
					value: ko.observable(obj.name() + ' ' + (+number[0] + 1)), 
					name: ko.observable(obj.name()), 
					children: ko.observableArray()
				});
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
		for(var i = 0; i < bindObj.rows().length; i++){
			bindObj.rows()[i].values.push({v: ko.observable(""), isEditing: ko.observable(false)});
		}
	});	
	
	bindObj.rows.subscribe(initRowValues);
	
	function initRowValues(useObj, obj){
		obj = useObj === true ? obj : bindObj.rows()[bindObj.rows().length - 1];
		if(bindObj.rows().length - 1 >= 0 && obj && !Array.isArray(obj.type().match(/parent/i))){
			for(var i = 0; i < bindObj.columns().length; i++){
				obj.values.push({v: ko.observable(""), isEditing: ko.observable(false)});
			}
		}	
	}
	
	initBindObj();

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
    var handlerUrl = runtime.handlerUrl(element, 'save_admin_settings');

    $(element).find('.save-button').bind('click', function(e) {
        e.stopPropagation();
        runtime.notify('cancel', {});
        updateBindObj();

        var outObj = JSON.stringify(ko.mapping.toJS(window.studioBindObj));

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
    
    window.studioBindObj.cancel = cancel;
	ko.applyBindings(window.studioBindObj, (element instanceof $ ? element[0] : element));
	
	function cancel(){
		runtime.notify('cancel', {});
	}
}

function updateBindObj(){
	
	var rowsArr = ko.mapping.fromJS(ko.toJS(window.studioBindObj.rows))();
	var columnsArr = ko.toJS(window.studioBindObj.columns);
	
	for(var i = 0; i < rowsArr.length; i++){
		
		rowsArr[i].value = rowsArr[i].value ? rowsArr[i].value : ko.observable(rowsArr[i].name());
		rowsArr[i].values = rowsArr[i].values ? rowsArr[i].values : ko.observableArray("");
		
		if(Array.isArray(rowsArr[i].type().match(/parent/i))){
			rowsArr[i].children = ko.observableArray();
			
			if(rowsArr[i].type() === "parentAppendable"){
				rowsArr[i].value(rowsArr[i].value() + " 1");
			}
		}
		else{
			rowsArr[i].isEditing = ko.observable(false);
		}
		
		for(var g = 0; g  < columnsArr.length; g++){
			rowsArr[i].values.push({v: ko.observable(""), isEditing: ko.observable(false)});
		}
	}
	
	bindObj.columns(columnsArr);
	bindObj.rows(rowsArr);
}

function initBindObj(){
	if({{tableStructure}} && {{tableStructure}}.columns){
		window.studioBindObj = ko.mapping.fromJS({{tableStructure}});
		window.studioBindObj.addColumn = addColumn;
		window.studioBindObj.addRow = addRow;
	}
	else{
		window.studioBindObj = {
			columns: ko.observableArray(),
			rows: ko.observableArray(),
			columnTypes: ["text", "textarea", "checkbox", "checkboxHighlight", "label", "number"],
			rowTypes: ["normal", "parent", "appendable", "parentAppendable"],
			allowNewColumns: true,
			allowNewRows: true,
			addColumn: addColumn,
			addRow: addRow,
		};
	}
	
	updateBindObj();
	
	function addColumn(){
		window.studioBindObj.columns.push({name: ko.observable("[Column name]"), placeholder: ko.observable(""), type: ko.observable("text")});
	}
	function addRow(){
		window.studioBindObj.rows.push({name: ko.observable("[Row name]"), type: ko.observable("normal")});
	}
}
