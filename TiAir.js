/*!
 * Titanium Air by Dawson Toth and Rick Blalock
 * https://github.com/dawsontoth/TiAir
 * 
 * VERSION: 2.0 (Wednesday, January 18, 2012)
 *
 * Provides a light, dynamic MVC framework for building Titanium Mobile applications.
 *
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

var TiAir = {};
(function (TiAir, context) {

    /**
     * The following are private variables, and should not be altered.
     */
    var models = {};
    var views = {};
    var controllers = {};
    var controllerID, actionID;

    /**
     * Invokes a particular URL, mapping any arguments onto a particular controller's action, then returning the result.
     * Note that these are not ordinarily URLs. They specify a controller, and then optionally an action, with forward
     * slashes separating them.
     * @param url A string URL you want to open.
     * @param {...number} var_args Any arguments that should be passed to the action.
     */
    TiAir.invoke = function (url) {
        // Before we call AirAction, we need to determine our context.

        // Tokenize our URL.
        var split = url.split('/');
        var tokenized = { controller: split[0] };
        var controller = getController(tokenized.controller);
        if (split.length == 1) {
            // Imply the action from the controller itself.
            tokenized.action = controller.def || Object.keys(controller.actions)[0];
        }
        else {
            tokenized.action = split[1];
        }

        // Determine which view needs to be loaded.
        controllerID = tokenized.controller;
        actionID = tokenized.action;

        // Call AirAction. It can handle the rest.
        var args = (Array().slice.call(arguments)).splice(1);
        args.unshift(controllerID + '/' + actionID);
        return context.AirAction.apply(context, args);
    };

    /**
     * Retrieves a predictably named file from the specified path without permanently altering the global scope.
     * @param path The path to the file that should be loaded.
     * @param variable The name of the variable that should be retrieved.
     */
    function getVarFromFile(path, variable) {
        // Save a reference to the existing variable. We'll need to restore it in a moment.
        var saved = context[variable];
        // Null out the variable, thereby giving us a blank slate to work with.
        var retVal = context[variable] = null;
        // Surround this with a try grabbing parse and other errors.
        try {
            // Try including the path.
            Ti.include(path);
            // Grab the desired variable.
            retVal = context[variable];
        }
        catch (err) {
            throw 'TiAir :: Error :: Unable to parse file: ' + path;
        }
        // Restore the existing variable.
        context[variable] = saved;
        // Return the retrieved value.
        return retVal;
    }

    /**
     * Retrieves a controller based on its id.
     * @param id
     */
    function getController(id) {
        // Have we retrieved this controller before?
        if (controllers[id]) {
            return controllers[id];
        }
        // If not, load it in.
        var path = '/controllers/' + id + '.js';
        var retVal = getVarFromFile(path, 'controller');
        if (!retVal) {
            throw 'TiAir :: Error :: Controller does not exist, or uses an invalid format: ' + path;
        }
        // Store it for later retrievals, and return it.
        return controllers[id] = retVal;
    }

    /**
     * Retrieves a view based on the controller and view ids.
     * @param controllerID
     * @param viewID
     */
    function getView(controllerID, viewID) {
        // Have we retrieved this view before?
        var retVal = views[controllerID] && views[controllerID][viewID];
        if (retVal != null) {
            return retVal;
        }
        // If not, load it in.
        var path = '/views/' + controllerID + '/' + viewID + '.js';
        retVal = getVarFromFile(path, 'view');
        if (!retVal) {
            throw 'TiAir :: Error :: No view found with id ' + viewID + ' in ' + controllerID + '.';
        }
        // Store it for later retrievals, and return it.
        if (!views[controllerID]) {
            views[controllerID] = {};
        }
        views[controllerID][viewID] = retVal;
        return retVal;
    }

    /**
     * Retrieves a model by its id.
     * @param id
     */
    function getModel(id) {
        // Have we retrieved this view before?
        if (models[id]) {
            return models[id];
        }
        // If not, load it in.
        var path = '/models/' + id + '.js';
        var retVal = getVarFromFile(path, 'model');
        if (!retVal) {
            throw 'TiAir :: Error :: Model does not exist, or uses invalid format: ' + path;
        }
        // Store it for later retrievals, and return it.
        return models[id] = retVal;
    }

    /**
     * Returns a view, mixing in any model data. Will throw an error if called otherwise.
     * @param {...number} var_args An optional string in the form "viewName" or "controller/viewName", followed by an optional model.
     */
    context.AirView = function () {
        // Make sure we are executing inside a context that we expect.
        if (!controllerID || !actionID) {
            throw 'TiAir :: Error :: View called from outside of a controller or action.';
        }
        // Hold on to the existing context information.
        var savedControllerID = controllerID;
        var savedActionID = actionID;

        // Now determine what view and model should be loaded.
        var viewID, model;
        // No arguments? Show the view with the same id as the action, then.
        if (arguments.length == 0) {
            viewID = actionID;
        }
        else {
            // Otherwise, we need to determine the proper view, and even the controller, from the arguments.
            if (typeof arguments[0] === 'string') {
                var url = arguments[0].split('/');
                if (url.length == 1) {
                    viewID = url[0];
                }
                else {
                    controllerID = url.shift();
                    viewID = url.join('/');
                }
                model = arguments.length > 1 && arguments[1];
            }
            else {
                viewID = actionID;
                model = arguments[0];
            }
        }

        // Now we have all we need; invoke the view.
        var view = getView(controllerID, viewID);
        var retVal = typeof view === 'function' ? view(model || {}) : view;

        // Finally, restore the previous context.
        controllerID = savedControllerID;
        actionID = savedActionID;

        return retVal;
    };

    /**
     * Returns a view, mixing in any model data.
     * @param id The id of the model to retrieve
     */
    context.AirModel = function (id) {
        var model = getModel(id);
        return typeof model === 'function' ? model() : model;
    };

    /**
     * Returns the response from an action.
     * @param url The url of the action to call
     * @param {...number} var_args Any arguments that should be passed to the action.
     */
    context.AirAction = function (url) {
        // Tokenize our URL.
        var split = url.split('/');
        var tokenized = { };
        if (split.length == 1) {
            tokenized.controller = controllerID;
            tokenized.action = split[0];
        }
        else {
            tokenized.controller = split[0];
            tokenized.action = split[1];
        }

        // See if we have a proper controller and action to handle the request.
        var controller = getController(tokenized.controller);
        if (controller.actions[tokenized.action] == null) {
            throw 'TiAir :: Error :: No action found with id ' + tokenized.actionID + ' in ' + tokenized.controllerID;
        }

        // Hold on to the existing context information.
        var savedControllerID = controllerID;
        var savedActionID = actionID;

        // Set up our context.
        controllerID = tokenized.controller;
        actionID = tokenized.action;

        // Call the action.
        var args = (Array().slice.call(arguments)).splice(1);
        var retVal = controller.actions[actionID].apply(controller.actions, args);

        // Finally, restore the previous context.
        controllerID = savedControllerID;
        actionID = savedActionID;

        return retVal;
    };

})(TiAir, this);