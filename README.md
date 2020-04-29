**This project is no longer being maintained. Please refer all questions to ADL: https://adlnet.gov/contact/**

Table XBlock
============
Table XBlock is powerful tool used to (you guessed it) create user-editable tables in an [edX course](https://www.edx.org/). It supports a high degree of configurability, user interactivity and user tracking with [xAPI](http://www.adlnet.gov/tla/experience-api/faq/). If you're unfamiliar with edX, its open source platform, or XBlocks, then [this may be a good place to start](http://code.edx.org/).

## Installation
[Download this XBlock](https://github.com/mickmuzac/Table-XBlock/archive/master.zip) to a suitable directory on your server and extract its contents (alternatively, you may clone this repository using git).

The steps to install all XBlocks can be found on [edX's XBlocks integration page](https://github.com/edx/edx-documentation/blob/master/en_us/developers/source/extending_platform/xblocks.rst#testing). Follow the instructions outlined in the `Testing` section if you're running the devstack or scroll down to those outlined under `Deploying your XBlock` if you're not. 

Use the value `table` whenever it's necessary to append the name of this XBlock to any list. Also, remember to [activate the virtualenv](http://docs.python-guide.org/en/latest/dev/virtualenvs/#basic-usage) that the edx platform is using *and* use the pip script that is provided by edX.

```shell
$ cd /edx/app/edxapp
$ source venvs/edxapp/bin/activate
$ sudo -u edxapp /edx/bin/pip.edxapp install /path/to/Table-XBlock
$ deactivate
```

As of the writing of this readme, there is no streamlined XBlock installation manager, though one has been proposed by edX developers.

## How to Use

To add a table, navigate to a unit, click `Advanced` and then click `Table XBlock`. This will add an empty table to your unit.

To edit the table, click `Edit`.

Note: Table XBlock doesn't support the creation of static tables.

#### Adding a new type of table

The `Display Name` property is used as the XBlock title shown to students in the course and should be unique per **type** of Table XBlock. `Display Name` is also used to help uniquely identify [xAPI states](#state_api).

Every instance of Table XBlock within your course is linked to an underlying table structure. The empty table you're seeing in your unit is called `Table` and is created by default. If you plan on using only one type of table (e.g only a multiplication table) then you may skip this step. The underlying data is shared for all instances of Table XBlock in a course making it easy to create the same table in a different unit.

If you need to create a new **type** of table with a totally different structure (not just a new instance), then click the `New` button under `Link Data` and follow the onscreen instructions.  

#### Adding columns

Table cells are defined as the intersection of some column and row. This dynamic definition is the reason static tables are unsupported. A cell's column determines the kind of information that a cell will display. 

To create a new column, click `Add column`. After doing do, you are prompted to fill in a number of different fields that help define the column.

**Column Label (Unique)**  
This is the label shown at the head of the table above this column. Column label names must be unique.

**Placeholder Text**  
Text that the user is shown when the input elements in this column are empty.

**Type**  
Defines the type of cells to display in this column. Table XBlock currently supports the types outlined in the table below.

|Type|Description|
|---|---|
|text|input element of type `text`.|
|textarea|`textarea` element. |
|checkbox|input element of type `checkbox`.|
|label|span containing text. This is not user editable.|
|number|input element of type `number`.|
|xAPI Button|button element that optionally sends off an xAPI statement to an LRS.|
|xAPI onetimeButton|button element that optionally sends an xAPI statement to an LRS only **once**.|

**Visible**  
Columns in each individual Table XBlock instance can be configured to be either visible or invisible. Be sure to check the checkbox to ensure that your columns are visible (they are not by default).

#### xAPI Tracking 
Whenever an active `xAPI Button` or `xAPI oneTimeButton` is clicked, an xAPI statement is generated for the row containing the button. The generated statement is configured to use the current student's user name as the statement's actor, [completed](http://www.adlnet.gov/expapi/verbs/completed/) as its verb, and the object as configured in the `xAPI Object` section below.



**xAPI Object**  
The generated statement's object (activity) is determined by the radio button selected below `xAPI Object`. When a `column` is designated as the `xAPI Object`, then the values of cells    If you plan on submitting xAPI statements, then the value of the cell in the column with this radio button selected will be configured as the object of all generated xAPI statements. 

In the example below, if the `Sport` column is selected as the `xAPI Object`, then `Basketball`, `Football`, and `Soccer` will be used as the object in statements generated for their respective rows. As stated earlier, the verb will always be [completed](http://www.adlnet.gov/expapi/verbs/completed/) and the actor is the user name of the current user.

|Sport|Time|Complete|
|:---:|:---:|:---:|
| Basketball | 30 min | [*xAPI Button*] |
| Football | 1 hr | [*xAPI Button*] |
| Soccer | 45 min | [*xAPI Button*] |

<a name="state_api"></a>
**State API**  
The completion states of all tables are synced using xAPI's [State API](https://github.com/adlnet/xAPI-Spec/blob/master/xAPI.md#stateapi). This allows students using an external application (such as a mobile app) to retrieve data stored within a table and mark a row as complete. Upon logging back into the edX course, any changes made in the external application will be reflected in the table as a row with a green background (indicating completion).

Use the following query string parameters to retrieve the state from an [LRS](http://www.adlnet.gov/tla/lrs/).

|Name|Value|
|---|---|
|activityId|`http://adlnet.gov/expapi/activities/`<**display name**>`/`|
|agent|`{"objectType":"Agent","account":{"homePage":"http://adlx.adlnet.gov","name":"`<**user name**>`"}}`|
|stateId|<**display name**>`_state`|

Note: 

* The `display name` is made lowercase, spaces are replaced with underscores and all other special characters are removed.
* Table XBlock does not support a way to "undo" a completion. 
* While the structure of a table is made available to external applications, any changes made to the structure outside of edX will not be reflected within the course. 

## License

Copyright 2014 United States Government, as represented by the Secretary of Defense.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
