/**
 * Create the home list view.
 * @param model A dictionary with a list of items.
 */
view = function (model) {
    var win = Ti.UI.createWindow({
        backgroundColor: '#fff'
    });
    var rows = [];
    for (var i = 0; i < model.list.length; i++) {
        rows.push(AirView('shared/row', model.list[i]));
    }
    win.add(AirView('table', rows));
    return win;
};