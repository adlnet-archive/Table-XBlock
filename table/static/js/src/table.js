(function(){
	/* Javascript for TableXBlock. */
	var bindObj, studioBindObj, visibleColumnsList = {{showColumns}}, xBlockCalled = false, userRows = {{userRows}}.rows || [], userRowsHandler;

	window.TableXBlock = function(runtime, element) {
		/*if(xBlockCalled){
			console.log("Student view already generated");
			return;
		}*/
		
		xBlockCalled = true;
		userRowsHandler = runtime.handlerUrl(element, 'save_student_rows');
		var currentRow;		
		
		bindObj = {
			columns: ko.observableArray(),
			rows: ko.observableArray(),
			columnTypes: ["text", "textarea", "checkbox", "checkboxHighlight", "label", "number"],
			rowTypes: ["normal", "parent", "appendable", "parentAppendable"],
			visibleColumns: function(){
				var tempArr = [];
				
				var columns = bindObj && bindObj.columns ? bindObj.columns() : [];
				for(var i = 0; i < columns.length; i++){
					if(visibleColumnsList.indexOf(columns[i].name) > -1){
						tempArr.push(columns[i]);
					}
				}
				
				return tempArr;
			},
			allowNewColumns: false,
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
				saveUserRows(bindObj.rows);
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
			},
			getCellWidth: function(){
				var perc = bindObj.allowNewColumns ? 100 / (bindObj.columns().length + 1) : 100 / bindObj.columns().length;
				return perc + '%';
			}
		}
		
		bindObj.columns.subscribe(function(newVal){
			var perc = bindObj.allowNewColumns ? 100 / (bindObj.columns().length + 1) : 100 / bindObj.columns().length;
			for(var i = 0; i < bindObj.rows().length; i++){
				bindObj.rows()[i].values.push({v: ko.observable(""), isEditing: ko.observable(false)});
			}
			
			//The cell has not been added yet, set timeout
			window.setTimeout(function(){
				$('.table_block .cell').not('#table_modal .cell').css('width', perc + '%');
			}, 250);
			console.log(perc);
		});
		
		bindObj.rows.subscribe(initRowValues);
		
		function initRowValues(useObj, obj){
			//Every time a row is added, initialize its values array...
			obj = useObj === true ? obj : bindObj.rows()[bindObj.rows().length - 1];
			if(bindObj.rows().length - 1 >= 0 && obj && !Array.isArray(obj.type().match(/parent/i))){
				for(var i = 0; i < bindObj.columns().length; i++){
					obj.values.push({v: ko.observable(""), isEditing: ko.observable(false)});
				}
			}	
		}
		
		initBindObj();

		$(element).on('click', '.editableLabel', function(){
			$(this).hide();
		});
		
		debugger;
		ko.applyBindings(bindObj, (element instanceof $ ? element[0] : element));
	}
	/* Javascript for studio view TableXBlock. */
	window.StudioTableXBlock = function(runtime, element) {
		var handlerUrl = runtime.handlerUrl(element, 'save_admin_settings');

		$(element).find('.save-button').bind('click', function(e) {
			e.stopPropagation();
			runtime.notify('cancel', {});
			updateBindObj();

			var outObj = JSON.stringify({tableStructure:ko.mapping.toJS(studioBindObj), showColumns: visibleColumnsList});

			$.ajax({
			  type: "POST",
			  url: handlerUrl,
			  data: outObj,
			  complete: function(res){
				  console.log("This is the response: ", res.responseText);
			  },
			  contentType: "application/json; charset=UTF-8",
			});
		});
		
		studioBindObj.cancel = cancel;
		ko.applyBindings(studioBindObj, (element instanceof $ ? element[0] : element));
		
		function cancel(){
			runtime.notify('cancel', {});
		}
	}
	
	function saveUserRows(arr){
		if(userRowsHandler){
			var outObj;
			if(arr){
				outObj = {rows: ko.toJS(arr)};
				userRows = outObj.rows;
				outObj = JSON.stringify(outObj);
			}
			else{
				outObj = JSON.stringify({rows: userRows})
			}

			$.ajax({
				  type: "POST",
				  url: userRowsHandler,
				  data: outObj,
				  complete: function(res){
					  console.log("This is the response for student rows: ", res.responseText);
				  },
				  contentType: "application/json; charset=UTF-8",
			});
		}
	}
	
	function cleanUserRows(baseRows){
		
		if(userRows.length < baseRows.length){
			return baseRows;
		}
		
		for(var i = 0, g = 0; i < baseRows.length; i++){
			while(userRows[g] && userRows[g].name.indexOf(baseRows[i].name) > -1){
				g++;
			}
		}
		
		
		//UPDATE USER ROWS HERE
		
		return userRows || baseRows;
	}

	function updateBindObj(){
		
		var outRows = cleanUserRows(ko.toJS(studioBindObj.rows));

		var rowsArr = ko.mapping.fromJS(outRows)();
		var columnsArr = ko.toJS(studioBindObj.columns);
		
		for(var i = 0; i < rowsArr.length; i++){
			rowsArr[i].value = rowsArr[i].value ? rowsArr[i].value : ko.observable(rowsArr[i].name());
			rowsArr[i].values = rowsArr[i].values ? rowsArr[i].values : ko.observableArray("");
			rowsArr[i].isEditing = ko.observable(false);
			
			//If is a parent and has no current children
			if(Array.isArray(rowsArr[i].type().match(/parent/i))){
				if(!rowsArr[i].children){
					rowsArr[i].children = ko.observableArray();
					
					if(rowsArr[i].type() === "parentAppendable"){
						rowsArr[i].value(rowsArr[i].value() + " 1");
					}
				}
				
				for(var g = 0; g  < rowsArr[i].children().length; g++){
					var childValuesArr = rowsArr[i].children()[g].values;
					
					for(var j = childValuesArr.length; j < columnsArr.length; j++){
						childValuesArr.push({v: ko.observable(""), isEditing: ko.observable(false)});
					}
				}
			}
			
			//If not a parent and has no current values... 
			else if(!rowsArr[i].children){
				for(var g = rowsArr[i].values.length; g  < columnsArr.length; g++){
					rowsArr[i].values.push({v: ko.observable(""), isEditing: ko.observable(false)});
				}
			}
		}
		
		saveUserRows(rowsArr);
		
		bindObj.columns(columnsArr);
		bindObj.rows(rowsArr);
	}

	function initBindObj(){
		if({{tableStructure}} && {{tableStructure}}.columns){
			studioBindObj = ko.mapping.fromJS({{tableStructure}});
			studioBindObj.addColumn = addColumn;
			studioBindObj.addRow = addRow;
			studioBindObj.columnVisible = columnVisible;
		}
		else{
			studioBindObj = {
				columns: ko.observableArray(),
				rows: ko.observableArray(),
				columnTypes: ["text", "textarea", "checkbox", "checkboxHighlight", "label", "number"],
				rowTypes: ["normal", "parent", "appendable", "parentAppendable"],
				allowNewColumns: false,
				allowNewRows: true,
				addColumn: addColumn,
				addRow: addRow,
				columnVisible: columnVisible
			};
		}

		updateBindObj();
		
		function columnVisible (column){
			return ko.computed({
				read: function(x){
					var col = column;
					return visibleColumnsList.indexOf(col.name()) > -1;
				},
				write: function(val){
					var col = column;
					var index = visibleColumnsList.indexOf(col.name());
					
					if(val && index < 0){
						visibleColumnsList.push(col.name());
					}
					else if(!val && index > -1){
						visibleColumnsList.splice(index, 1);
					}
				}
			});
		};
		
		function addColumn(){
			studioBindObj.columns.push({name: ko.observable("[Column name]"), placeholder: ko.observable(""), type: ko.observable("text")});
		}
		function addRow(){
			studioBindObj.rows.push({name: ko.observable("[Row name]"), type: ko.observable("normal")});
		}
	}
})();
