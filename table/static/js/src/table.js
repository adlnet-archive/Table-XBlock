(function(){
	/* Javascript for TableXBlock. */
	var bindObj, studioBindObj, 
	visibleColumnsList = {{showColumns}}, 
	xBlockCalled = false,
	allUserObjs = {{userRows}}, 
	userObj = allUserObjs["{{currentStructure}}"] || {}, 
	userRows = userObj.rows || [], 
	timestamp = userObj.timestamp || 0,
	structureTimestamp,
	userRowsHandler, handlerUrl,
	fullTableStructure = {{tableStructure}},
	currentStructure = "{{currentStructure}}",
	studioRuntime, studioElement;

	window['TableXBlock{{randFuncName}}'] = function(runtime, element) {
		/*if(xBlockCalled){
			console.log("Student view already generated");
			return;
		}*/
		xBlockCalled = true;
		userRowsHandler = runtime.handlerUrl(element, 'save_student_rows');
		trackDataHandler = runtime.handlerUrl(element, 'track_data');

		var currentRow;		
		
		bindObj = {
			columns: ko.observableArray(),
			rows: ko.observableArray(),
			allowNewColumns: false,
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
				var perc = bindObj.allowNewColumns ? 100 / (bindObj.visibleColumns().length + 1) : 100 / bindObj.visibleColumns().length;
				return perc + '%';
			},
			saveUserData: function(){
				saveUserRows(bindObj.rows);
			},
			addGreenToRow: function(row){
				return ko.computed(function(){
					var values = row.values();
					for(var i = 0; i < values.length; i++){
						if(values[i].v() && bindObj.columns()[i].type == "xAPI onetimeButton"){
							return {green: true};
						}
					}
					return {green: false};					
				});
			},
			handleButtonClick: function(row, index){
				
				return function(target){
					console.log(row, index, target);
					if(row.values()[index].v() && bindObj.columns()[index].type == "xAPI onetimeButton"){
						console.error("This activity has already been completed: ", ko.toJS(row));
						window.alert("This activity has already been completed");
						return;
					}
					
					var prefix = 'http://adlnet.gov/expapi/activities/' + sanitize_str(studioBindObj.displayName()) + '/';
					var stmt = new ADL.XAPIStatement();
					var contextKey = "actid:" + studioBindObj.displayName().toLowerCase().replace(/ /g, '_');
					var xAPIButtonIndex = -1;
					stmt.verb = ADL.verbs.completed;
					stmt.result = { extensions: {} };
					stmt.context = { extensions: {} };
					stmt.context.extensions[contextKey] = {};
					
					//Does this table have an xAPI onetime column?
					for(var i = 0; i < bindObj.columns().length; i++){
						if(bindObj.columns()[i].type == "xAPI onetimeButton"){
							xAPIButtonIndex = i;
							break;
						}
					}
					
					if(studioBindObj.xAPIObject()){
						var cols = bindObj.columns(), i = 0, key = "";
						
						//Find the value of "result key"
						for(i = 0; i < cols.length; i++){
							if(cols[i].name === studioBindObj.xAPIObject()){
								var cellVal = row.values()[i].v();
								if(cellVal){
									stmt.object =  new ADL.XAPIStatement.Activity(prefix + sanitize_str(cellVal), cellVal);
									key = 'http://adlnet.gov/expapi/extensions/' + sanitize_str(studioBindObj.displayName()) + '/' + sanitize_str(cols[i].name);
								}
								break;
							}
						}
						
						if(!stmt.object){
							console.error("xAPI statement can not be sent without a valid " + cols[i].name + " value");
							window.alert("xAPI statement can not be sent without a valid " + cols[i].name + " value");
							return;
						}
						
						//This makes the row green
						row.values()[index].v(true);
						
						//For each cell in this row, add its value to result extension
						var ext = stmt.result.extensions[key] = {}, rowValues = row.values();
						for(var g = 0; g < rowValues.length && g < cols.length; g++){
							if(cols[g].xAPI){
								ext[sanitize_str(cols[g].name)] = rowValues[g].v();
							}
						}
						
						//Find columns that should be added to context and find corresponding cells
						var numRows = 0, trueCount = 0, allRows = ko.toJS(bindObj.rows);
						for(var g = 0; g < cols.length; g++){
							if(cols[g].context){
								for(var j = 0; j < allRows.length; j++){
									var currentRow = allRows[j];
									if(!Array.isArray(currentRow.type.match(/parent/i)) && currentRow.values[g].v){
										numRows++;
										if(currentRow.values[g].v && (xAPIButtonIndex < 0 || currentRow.values[xAPIButtonIndex].v)){
											trueCount++;
										}
									}
									else{
										for(var h = 0; h < currentRow.children.length; h++){
											var childVals = currentRow.children[h].values;
											if(childVals[g].v){
												numRows++;
												if(childVals[g].v && (xAPIButtonIndex < 0 || childVals[xAPIButtonIndex].v)){
													trueCount++;
												}
											}
										}
									}
								}
								
								stmt.context.extensions[contextKey][sanitize_str(cols[g].name)] =  {current: trueCount, total: numRows};
								numRows = trueCount = 0;
							}
						}
						
						//If row has a parent, include its name in contextActivity
						var parentRow = getParentRow(row);
						if(parentRow){
							stmt.context.contextActivities = { 
								grouping: [{
										id: prefix + sanitize_str(parentRow.name())
									}]
								};		
						}
						
						var outObj = JSON.stringify(stmt);
						console.log(JSON.stringify(stmt, null, 2));
						
						$.ajax({
						  type: "POST",
						  url: trackDataHandler,
						  data: outObj,
						  complete: function(res){
							  console.log("This is the response for tracking data: ", res.responseText);
							  saveUserRows(bindObj.rows);
						  },
						  contentType: "application/json; charset=UTF-8",
						});
					}
					else{
						console.error("xAPI statement can not be sent without a valid object");
						window.alert("xAPI statement can not be sent without a valid object");
					}
				}
			},
			clearUserData: function(){
				var tempRows = bindObj.rows();
				for(var i = tempRows.length - 1; i >= 0; i--){
					var numArr = tempRows[i].value().match(/[0-9]+/g);
					if(Array.isArray(numArr) && (+numArr[numArr.length-1]) > 1){
						tempRows.splice(i, 1);
					}
					else{
						if(tempRows[i].children){
							tempRows[i].children.removeAll();
						}
						if(tempRows[i].values){
							tempRows[i].values().length = 0;
							initRowValues(true, tempRows[i]);
						}
					}
				}
				
				bindObj.rows.valueHasMutated();
				saveUserRows(bindObj.rows);
			}
		}
		
		bindObj.columns.subscribe(function(newVal){
			var perc = bindObj.allowNewColumns ? 100 / (bindObj.visibleColumns().length + 1) : 100 / bindObj.visibleColumns().length;
			for(var i = 0; i < bindObj.rows().length; i++){
				bindObj.rows()[i].values.push({v: ko.observable(""), isEditing: ko.observable(false)});
			}
			
			//The cell has not been added yet, set timeout
			window.setTimeout(function(){
				$('.table_block .cell').not('#table_modal .cell').not('.nfRow .cell').css('width', perc + '%');
			}, 250);
			console.log(perc);
		});
		
		bindObj.rows.subscribe(initRowValues);
		
		function initRowValues(useObj, obj){
			//Every time a row is added, initialize its values array...
			obj = useObj === true ? obj : bindObj.rows()[bindObj.rows().length - 1];
			if(bindObj.rows().length - 1 >= 0 && obj && !Array.isArray(obj.type().match(/parent/i))){
				for(var i = obj.values().length; i < bindObj.columns().length; i++){
					obj.values.push({v: ko.observable(""), isEditing: ko.observable(false)});
				}
			}	
		}
		
		initBindObj();

		$(element).on('click', '.editableLabel', function(){
			$(this).hide();
		});
		
		ko.applyBindings(bindObj, (element instanceof $ ? element[0] : element));
	}
	/* Javascript for studio view TableXBlock. */
	window.StudioTableXBlock = function(runtime, element) {
		handlerUrl = runtime.handlerUrl(element, 'save_admin_settings');
		studioRuntime = runtime;
		studioElement = element;

		$(element).find('.save-button').bind('click', saveStudioStructure);
		
		studioBindObj.cancel = cancel;
		ko.applyBindings(studioBindObj, (element instanceof $ ? element[0] : element));
		
		function cancel(){
			runtime.notify('cancel', {});
		}
	}
	
	function saveStudioStructure(e){
		if(e) {
			e.stopPropagation();
			studioRuntime.notify('cancel', {});
		}
		updateBindObj();
		
		var finalTableStructure = ko.mapping.toJS(studioBindObj);
		finalTableStructure._timestamp = Date.now();
		
		delete finalTableStructure.currentStructure;
		delete finalTableStructure.allStructures;

		fullTableStructure[studioBindObj.currentStructure()] = finalTableStructure;
		localStorage.tableStructure = JSON.stringify(fullTableStructure);
		
		var outObj = JSON.stringify({
			tableStructure: fullTableStructure, 
			showColumns: visibleColumnsList, 
			displayName: finalTableStructure.displayName, 
			currentStructure: studioBindObj.currentStructure()
		});

		$.ajax({
		  type: "POST",
		  url: handlerUrl,
		  data: outObj,
		  complete: function(res){
			  console.log("This is the response: ", res.responseText);
		  },
		  contentType: "application/json; charset=UTF-8",
		});
	}
	
	function getParentRow(row){
		var rows = bindObj.rows(), emptyArr = [];
		for(var i = 0; i < rows.length; i++){
			var children = rows[i].children ? rows[i].children() : emptyArr;
			if(children.length > 0){
				for(var g = 0; g < children.length; g++){
					if(row == children[g]){
						return rows[i];
					}
				}
			}
		}
		
		return false;
	}
	
	function saveUserRows(arr){
		if(userRowsHandler){
			var outObj;
			if(arr){
				userRows = arr = ko.toJS(arr);
				allUserObjs[currentStructure] = {rows: arr, timestamp: (arr.length == 0 || timestamp < structureTimestamp ? Date.now() : timestamp)};
				outObj = JSON.stringify(allUserObjs);
			}
			else{
				allUserObjs[currentStructure] = {rows: userRows};
				outObj = JSON.stringify(allUserObjs)
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
		if(timestamp < structureTimestamp || userRows.length < baseRows.length){
			saveUserRows([]);
			return baseRows;
		}
		
		else return userRows;
	}
	function sanitize_str(str){
		return str.toLowerCase().replace(/[^0-9a-zA-Z ]/gi, '').replace(/ /gi, '_');
	}
	function updateBindObj(){
		
		var outRows = cleanUserRows(ko.toJS(studioBindObj.rows));

		var rowsArr = ko.mapping.fromJS(outRows)();
		var columnsArr = ko.toJS(studioBindObj.columns);
		
		for(var i = 0; i < rowsArr.length; i++){
			rowsArr[i].value = rowsArr[i].value ? rowsArr[i].value : ko.observable(rowsArr[i].name());
			rowsArr[i].values = rowsArr[i].values ? rowsArr[i].values : ko.observableArray("");
			rowsArr[i].isEditing = ko.observable(false);
			
			//If row is a parent
			if(Array.isArray(rowsArr[i].type().match(/parent/i))){
				if(!rowsArr[i].children){
					rowsArr[i].children = ko.observableArray();
					
					if(rowsArr[i].type() === "parentAppendable"){
						rowsArr[i].value(rowsArr[i].value() + " 1");
					}
				}
				
				//Ensure children have enough values
				for(var g = 0; g  < rowsArr[i].children().length; g++){
					var childValuesArr = rowsArr[i].children()[g].values;
					
					for(var j = childValuesArr.length; j < columnsArr.length; j++){
						childValuesArr.push({v: ko.observable(""), isEditing: ko.observable(false)});
					}
				}
			}
			
			//If not a parent and does not have enough current values... 
			else if(!rowsArr[i].children){
				for(var g = rowsArr[i].values.length; g  < columnsArr.length; g++){
					rowsArr[i].values.push({v: ko.observable(""), isEditing: ko.observable(false)});
				}
			}
		}
		
		saveUserRows(rowsArr);
		
		bindObj.columns.removeAll();
		bindObj.columns(columnsArr);
		
		bindObj.rows.removeAll();
		bindObj.rows(rowsArr);
	}

	function initBindObj(){
		var tempTableStructure = fullTableStructure[currentStructure] || {};
		structureTimestamp = tempTableStructure._timestamp ? tempTableStructure._timestamp : 0;
		
		if(tempTableStructure && tempTableStructure.columns){
			studioBindObj = ko.mapping.fromJS(tempTableStructure);
		}
		else if(localStorage.tableStructure && localStorage.tableStructure[currentStructure]){
			studioBindObj = ko.mapping.fromJS(JSON.parse(localStorage.tableStructure[currentStructure]));
		}
		else{
			studioBindObj = {
				columns: ko.observableArray(),
				rows: ko.observableArray(),
				columnTypes: ["text", "textarea", "checkbox", "label", "number", "xAPI button", "xAPI onetimeButton"],
				rowTypes: ["normal", "parent", "appendable", "parentAppendable"],
				allowNewColumns: false,
				allowNewRows: true,
				xAPIObject: ko.observable(""),
				displayName: ko.observable("{{display_name}}")
			};
		}

		studioBindObj.addColumn = addColumn;
		studioBindObj.addRow = addRow;
		studioBindObj.columnVisible = columnVisible;
		studioBindObj.clearTableStructure = clearTableStructure;
		studioBindObj.setXAPIObject =  setXAPIObject;
		studioBindObj.addNewStructure = addNewStructure;
		studioBindObj.allStructures = ko.observableArray(Object.keys(fullTableStructure));
		studioBindObj.currentStructure = ko.observable(currentStructure);
		studioBindObj.currentStructure.subscribe(currentStructChange);

		updateBindObj();
		
		function currentStructChange(newVal){

			//initBindObj();

			currentStructure = newVal;
			studioBindObj.columns.removeAll();
			studioBindObj.rows.removeAll();

			var struct = ko.mapping.fromJS($.extend(true, {rows: [], columns: [], xAPIObject: "", displayName: "Table XBlock"}, fullTableStructure[currentStructure]));
			var rows = struct.rows();
			var cols = struct.columns();
			
			studioBindObj.xAPIObject(struct.xAPIObject());
			studioBindObj.displayName(struct.displayName());
			for(var i = 0; i < rows.length || i < cols.length; i++){
				if(i < rows.length)
					studioBindObj.rows.push(rows[i]);
				if(i < cols.length)
					studioBindObj.columns.push(cols[i]);
			}
			
			saveStudioStructure();
		}
		
		function addNewStructure(){
			console.log("Click!!");
			var structName = window.prompt("Enter a unique name for the new table");
			
			if(structName){
				studioBindObj.allStructures.push(structName);
				studioBindObj.currentStructure(structName);
				studioBindObj.clearTableStructure();								
			}
		}
		
		function setXAPIObject(obj){
			var o = obj;
			if(o.name() != studioBindObj.xAPIObject()){
				studioBindObj.xAPIObject(o.name());
			}
			else{
				studioBindObj.xAPIObject("");
			}
			return true;
		}
		function clearTableStructure(){
			var currentStructure = typeof studioBindObj.currentStructure === "string" ? studioBindObj.currentStructure : studioBindObj.currentStructure();
			bindObj.rows.removeAll();
			bindObj.columns.removeAll();
			studioBindObj.columns.removeAll();
			studioBindObj.rows.removeAll();
			
			bindObj.clearUserData();			
			
			delete fullTableStructure[currentStructure];
			fullTableStructure["Table"] = fullTableStructure["Table"] ? fullTableStructure["Table"] : {};
			localStorage.tableStructure = JSON.stringify(fullTableStructure);
			
			$.ajax({
				  type: "POST",
				  url: handlerUrl,
				  data: JSON.stringify({tableStructure: fullTableStructure, showColumns: [], displayName: "Table XBlock", currentStructure: "Table"}),
				  complete: function(res){
					  console.log("This is the response: ", res.responseText);
					  window.alert("All cleared!");
				  },
				  contentType: "application/json; charset=UTF-8",
				});		
		}
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
		}
		function addColumn(){
			studioBindObj.columns.push({name: ko.observable("[Column name]"), placeholder: ko.observable(""), type: ko.observable("text"), xAPI: ko.observable(false), context: ko.observable(false)});
		}
		function addRow(){
			studioBindObj.rows.push({name: ko.observable("[Row name]"), type: ko.observable("normal")});
		}
	}
})();
