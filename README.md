WHAT IS TiAir?
===========================
TiAir is an MVC framework for Appcelerator Titanium Mobile.


QUICK START
===========================
Copy the files from example/Resources in to your project.

Include the TiAir.js file in your app.js, and then "invoke" a URL.

<pre>
Ti.include('TiAir.js');

var homeWindow = TiAir.invoke('home');
homeWindow.open();
</pre>

For more explanation on how this works, check out each of the three "HOW _ WORKS" sections below.


REQUIRED STRUCTURE
===========================
TiAir.js must be included from your root context, and you must create three subdirectories: "models", "views", and
"controllers". Check out each of the three "HOW _ WORKS" sections for additional requirements.


HOW MODELS WORK
===========================
Models are data, pure and simple. They are not views, and they do not contain business logic.

In your "models" folder, you will have a series of directories and JavaScript files.

The JavaScript files must set the "model" variable to something. Note: I say "set", not "define". Do NOT place "var"
before the variable!

You can set it to an ordinary object, like a string, integer, array, or object:
<pre>
model = {};
</pre>

Or you can set it to a function:
<pre>
model = function() { return 'Hello, world!' };
</pre>

Let's assume we have a file named "models/test.js".

These models can then be referenced from your controllers by their file names (without the extension):
<pre>
var result = AirModel('test');
</pre>

The "result" variable will then contain whatever I set model equal to in the "models/test.js" file. (If I used a function,
then that function will be executed and its return value will be stored in "result".)

You can also place models in subdirectories to help keep large projects organized:
<pre>
var result = AirModel('sub/test');
</pre>


HOW VIEWS WORK
===========================
Views show something to the user. They can reference other views, and they can receive models when they are created.

Views are children of a particular controller, or of the special "shared" folder. That is reflected in your folder
structure. In the "views" folder, you will see a series of folders. These correspond to the controllers you have created.

In each folder, there will be a series of JavaScript files defining your views. Just like with the models, we will
define an existing variable, "view":

<pre>
view = function (model) {
    var row = Ti.UI.createTableViewRow();
    row.add(AirView('title', model));
    row.add(AirView('shared/sub/label', { title: '>', align: 'right' }));
    return row;
};
</pre>

As with models, we can set "view" to a function or to an simpler object like a view.

Notice that we can also reference other views:
<pre>
var view = AirView('title', model);
</pre>

Go to the "AirView" section to find out more about it.


HOW CONTROLLERS WORK
===========================
Controllers decide what views and models should be used and displayed.
 
They are defined in the "controllers" folder, and cannot be nested.

<pre>
controller = {
    def: 'list',
    actions: {
        list: function() {
            return AirView(AirModel('test/blah'));
        }
    }
};
</pre>

Controllers are a bit more rigid than views or models. They must be defined as a dictionary with the following keys:

	1) "actions": A dictionary of the various actions a controller can take.
	2) "def": The default action for this controller. Defaults to the first defined action.
	
Go to the "AirView" section to find out more about including views.

                                                                   
The TiAir.invoke METHOD
===========================
The TiAir.invoke method is meant to bootstrap your application. It is a light wrapper around the AirAction function, and
is only meant to be used in your app.js when your app first starts.


The AirView FUNCTION
===========================
The AirView function lets you reference views. The name of views and the passed in arguments can be intelligently
guessed based on where you are calling the function.

Take for example this controller definition in controllers/test.js. The "list" action is being invoked:

<pre>
controller = {
    actions: {
        list: function() {
            return AirView();
        }
    }
};
</pre>

Without any arguments, AirView searches in the "views/test" directory for a view named "list".

Alternatively, we can provide a model:

<pre>
controller = {
    actions: {
        list: function() {
            return AirView({ some: 'data' });
        }
    }
};
</pre>

And the name of the view will again be implied to "list".

You can also specify the name of the view to load:

<pre>
controller = {
    actions: {
        list: function() {
            return AirView('anotherView');
        }
    }
};
</pre>


The AirModel FUNCTION
===========================
AirModel takes in a single argument: the ID of a model. It searches in the "models" directory for it, and returns it. If
the model is a function, it is executed each time it is requested, and the result of the function is returned.

<pre>
var result = AirModel('sub/test');
</pre>


The AirAction FUNCTION
===========================
A controller can reference other actions as part of its own response. This allows for more complex combinations to be
achieved:

<pre>
controller = {
    actions: {
    	details: function() {
    		return AirView();
    	}
        doubleDetails: function() {
        	var win = Ti.UI.createWindow();
        	win.add(AirAction('details'));
        	win.add(AirAction('details'));
            return AirView('anotherView');
        }
    }
};
</pre>

This is also how you move from one controller to another:

<pre>
var button = Ti.UI.createButton({
	title: 'About Us'
});
button.addEventListener('click', function() {
	var about = AirAction('about/details');
	about.open();
});
</pre>

You can also pass more than one argument to AirAction, and they will be passed to the handling action:

<pre>
AirAction('home', 'test');
</pre>

<pre>
controller = {
    def: 'list',
    actions: {
        list: function(title) {
            alert(title); // <-- 'test'
        }
    }
};
</pre>


WHAT ABOUT VERSION 1.0?
==========================
While it is no longer supported, version 1.0 has its own branch in the main repository:

https://github.com/dawsontoth/TiAir/branches/1.0


CONTACT INFORMATION
===========================

TiAir was made by Dawson Toth and Rick Blaloc from Appcelerator, Inc.

Note that this doesn't mean TiAir is officially supported.
If you have issues, PLEASE open an issue on GitHub and we will work on getting it resolved!
Don't contact Appcelerator with issues, or sue them (or me, please) if you have problems.