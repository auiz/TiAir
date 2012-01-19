controller = {
    def: 'list',
    actions: {
        list: function() {
            return AirView(AirModel('fruitList'));
        }
    }
};