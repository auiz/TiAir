view = function (model) {
    var row = Ti.UI.createTableViewRow();
    row.add(AirView('label', model));
    row.add(AirView('label', { title: '>', align: 'right' }));
    return row;
};