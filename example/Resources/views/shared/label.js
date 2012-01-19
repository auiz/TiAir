view = function (model) {
    if (typeof(model) == 'string') {
        model = { title: model };
    }
    var label = Ti.UI.createLabel({
        text: model.title, width: 'auto', height: 'auto'
    });
    switch (model.align) {
        case 'right':
            label.right = 10;
            break;
        default: // 'left'
            label.left = 10;
            break;
    }
    return label;
};