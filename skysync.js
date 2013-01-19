// Namespace
Ext.ns("SYNOCOMMUNITY.Skysync");

// Const
SYNOCOMMUNITY.Skysync.DEFAULT_HEIGHT = 480;
SYNOCOMMUNITY.Skysync.MAIN_WIDTH = 750;
SYNOCOMMUNITY.Skysync.LIST_WIDTH = 210;

// Application
SYNOCOMMUNITY.Skysync.AppInstance = Ext.extend(SYNO.SDS.AppInstance, {
    appWindowName: "SYNOCOMMUNITY.Skysync.AppWindow",
    constructor: function () {
        SYNOCOMMUNITY.Skysync.AppInstance.superclass.constructor.apply(this, arguments);
    }
});

// Main window
SYNOCOMMUNITY.Skysync.AppWindow = Ext.extend(SYNO.SDS.AppWindow, {
    appInstance: null,
    mainPanel: null,
    constructor: function (config) {
        this.appInstance = config.appInstance;
        //this.mainPanel = new SYNOCOMMUNITY.Skysync.MainPanel({
        //    owner: this
        //});
        config = Ext.apply({
            resizable: true,
            maximizable: true,
            minimizable: true,
            width: SYNOCOMMUNITY.Skysync.MAIN_WIDTH,
            height: SYNOCOMMUNITY.Skysync.DEFAULT_HEIGHT,
            layout: "fit",
            border: false,
            cls: "synocommunity-skysync"//,
            //items: [this.mainPanel]
        }, config);
        SYNOCOMMUNITY.Skysync.AppWindow.superclass.constructor.call(this, config);
    },
    onOpen: function (a) {
        SYNOCOMMUNITY.Skysync.AppWindow.superclass.onOpen.call(this, a);
        //this.mainPanel.onActivate();
    },
    onRequest: function (a) {
        SYNOCOMMUNITY.Skysync.AppWindow.superclass.onRequest.call(this, a);
    },
    onClose: function () {
        if (SYNOCOMMUNITY.Skysync.AppWindow.superclass.onClose.apply(this, arguments)) {
            this.doClose();
            //this.mainPanel.onDeactivate();
            return true;
        }
        return false;
    },
    setStatus: function (status) {
        status = status || {};
        /*var toolbar = this.mainPanel.cardPanel.layout.activeItem.getFooterToolbar();
        if (toolbar && Ext.isFunction(toolbar.setStatus)) {
            toolbar.setStatus(status)
        } else {
            this.getMsgBox().alert("Message", status.text)
        }*/
    }
});
