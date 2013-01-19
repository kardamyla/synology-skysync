// Namespace
Ext.ns("PLATANUS.Skysync");

// Translator
_V = function (category, element) {
    return _TT("PLATANUS.Skysync.AppInstance", category, element)
}

// Direct API
Ext.Direct.addProvider({
    "url": "3rdparty/subliminal/subliminal.cgi/direct/router",
    "namespace": "PLATANUS.Skysync.Remote",
    "type": "remoting",
    "actions": {
        "Subliminal": [{
            "name": "load",
            "len": 0
        }, {
            "formHandler": true,
            "name": "save",
            "len": 4
        }, {
            "name": "scan",
            "len": 0
        }],
        "Directories": [{
            "name": "read",
            "len": 0
        }, {
            "name": "create",
            "len": 1
        }, {
            "name": "update",
            "len": 1
        }, {
            "name": "destroy",
            "len": 1
        }, {
            "name": "scan",
            "len": 1
        }]
    }
});

// Fix for RadioGroup reset bug
/*Ext.form.RadioGroup.override({
    reset: function () {
        if (this.originalValue) {
            this.setValue(this.originalValue.inputValue);
        } else {
            this.eachItem(function (c) {
                if (c.reset) {
                    c.reset();
                }
            });
        }

        (function () {
            this.clearInvalid();
        }).defer(50, this);
    },
    isDirty: function () {
        if (this.disabled || !this.rendered) {
            return false;
        }
        return String(this.getValue().inputValue) !== String(this.originalValue.inputValue);
    }
});*/

// Const
PLATANUS.Skysync.DEFAULT_HEIGHT = 480;
PLATANUS.Skysync.MAIN_WIDTH = 750;
PLATANUS.Skysync.LIST_WIDTH = 210;

// Application
PLATANUS.Skysync.AppInstance = Ext.extend(SYNO.SDS.AppInstance, {
    appWindowName: "PLATANUS.Skysync.AppWindow",
    constructor: function () {
        PLATANUS.Skysync.AppInstance.superclass.constructor.apply(this, arguments);
    }
});

// Main window
PLATANUS.Skysync.AppWindow = Ext.extend(SYNO.SDS.AppWindow, {
    appInstance: null,
    mainPanel: null,
    constructor: function (config) {
        this.appInstance = config.appInstance;
        this.mainPanel = new PLATANUS.Skysync.MainPanel({
            owner: this
        });
        config = Ext.apply({
            resizable: true,
            maximizable: true,
            minimizable: true,
            width: PLATANUS.Skysync.MAIN_WIDTH,
            height: PLATANUS.Skysync.DEFAULT_HEIGHT,
            layout: "fit",
            border: false,
            cls: "platanus-subliminal",
            items: [this.mainPanel]
        }, config);
        PLATANUS.Skysync.AppWindow.superclass.constructor.call(this, config);
    },
    onOpen: function (a) {
        PLATANUS.Skysync.AppWindow.superclass.onOpen.call(this, a);
        this.mainPanel.onActivate();
    },
    onRequest: function (a) {
        PLATANUS.Skysync.AppWindow.superclass.onRequest.call(this, a);
    },
    onClose: function () {
        if (PLATANUS.Skysync.AppWindow.superclass.onClose.apply(this, arguments)) {
            this.doClose();
            this.mainPanel.onDeactivate();
            return true;
        }
        return false;
    },
    setStatus: function (status) {
        status = status || {};
        var toolbar = this.mainPanel.cardPanel.layout.activeItem.getFooterToolbar();
        if (toolbar && Ext.isFunction(toolbar.setStatus)) {
            toolbar.setStatus(status)
        } else {
            this.getMsgBox().alert("Message", status.text)
        }
    }
});

// Main panel
PLATANUS.Skysync.MainPanel = Ext.extend(Ext.Panel, {
    listPanel: null,
    cardPanel: null,
    constructor: function (config) {
        this.owner = config.owner;
        var a = new PLATANUS.Skysync.ListView({
            module: this
        });
        this.listPanel = new Ext.Panel({
            region: "west",
            width: PLATANUS.Skysync.LIST_WIDTH,
            height: PLATANUS.Skysync.DEFAULT_HEIGHT,
            cls: "platanus-subliminal-list",
            items: [a],
            listeners: {
                scope: this,
                activate: this.onActivate,
                deactivate: this.onDeactivate
            },
            onActivate: function (panel) {
                a.onActivate()
            }
        });
        this.listView = a;
        this.curHeight = PLATANUS.Skysync.DEFAULT_HEIGHT;
        this.cardPanel = new PLATANUS.Skysync.MainCardPanel({
            module: this,
            owner: config.owner,
            itemId: "grid",
            region: "center"
        });
        this.id_panel = [
            ["parameters", this.cardPanel.PanelParameters],
            ["directories", this.cardPanel.PanelDirectories]
        ];
        PLATANUS.Skysync.MainPanel.superclass.constructor.call(this, {
            border: false,
            layout: "border",
            height: PLATANUS.Skysync.DEFAULT_HEIGHT,
            monitorResize: true,
            items: [this.listPanel, this.cardPanel]
        });
    },
    onActivate: function (panel) {
        if (!this.isVisible()) {
            return
        }
        this.listPanel.onActivate(panel);
        this.cardPanel.onActivate(panel);
    },
    onDeactivate: function (panel) {
        if (!this.rendered) {
            return
        }
        this.cardPanel.onDeactivate(panel);
    },
    doSwitchPanel: function (id_panel) {
        var c = this.cardPanel.getLayout();
        c.setActiveItem(id_panel);
        var b;
        for (b = 0; b < this.id_panel.length; b++) {
            var a = this.id_panel[b][1];
            if (id_panel === this.id_panel[b][0]) {
                a.onActivate();
                break
            }
        }
    },
    getPanelHeight: function (id_panel) {
        return PLATANUS.Skysync.DEFAULT_HEIGHT
    },
    isPanelDirty: function (c) {
        var b;
        for (b = 0; b < this.id_panel.length; b++) {
            if (c === this.id_panel[b][0]) {
                var a = this.id_panel[b][1];
                if ("undefined" === typeof a.checkDirty) {
                    return false
                }
                if (true == a.checkDirty()) {
                    return true
                }
                break
            }
        }
        return false
    },
    panelDeactivate: function (c) {
        for (var b = 0; b < this.id_panel.length; b++) {
            if (c === this.id_panel[b][0]) {
                var a = this.id_panel[b][1];
                if ("undefined" === typeof a.onDeactivate) {
                    return
                }
                a.onDeactivate();
                return
            }
        }
        return
    },
    switchPanel: function (f) {
        var c = this.cardPanel.getLayout();
        var b = c.activeItem.itemId;
        if (f === b) {
            return
        }
        if (Ext.isIE) {
            this.doSwitchPanel(f);
            return
        }
        var a = this.getPanelHeight(f);
        if (this.curHeight == a) {
            this.doSwitchPanel(f);
            return
        }
        this.owner.el.disableShadow();
        var d = this.owner.body;
        var e = function () {
                d.clearOpacity();
                this.owner.getEl().setHeight("auto");
                d.setHeight("auto");
                this.owner.setHeight(a);
                this.owner.el.enableShadow();
                this.owner.syncShadow();
                this.doSwitchPanel(f)
            };
        d.shift({
            height: a - 54,
            duration: 0.3,
            opacity: 0.1,
            scope: this,
            callback: e
        });
        this.curHeight = a
    }
});

// List view
PLATANUS.Skysync.ListView = Ext.extend(Ext.list.ListView, {
    constructor: function (config) {
        var store = new Ext.data.JsonStore({
            data: {
                items: [{
                    title: _V("ui", "console"),
                    id: "console_title"
                }, {
                    title: _V("ui", "parameters"),
                    id: "parameters"
                }, {
                    title: _V("ui", "directories"),
                    id: "directories"
                }]
            },
            autoLoad: true,
            root: "items",
            fields: ["title", "id"]
        });
        config = Ext.apply({
            cls: "platanus-subliminal-list",
            padding: 10,
            split: false,
            trackOver: false,
            hideHeaders: true,
            singleSelect: true,
            store: store,
            columns: [{
                dataIndex: "title",
                cls: "platanus-subliminal-list-column",
                sortable: false,
                tpl: '<div class="platanus-subliminal-list-{id}">{title}</div>'
            }],
            listeners: {
                scope: this,
                beforeclick: this.onBeforeClick,
                selectionchange: this.onListSelect,
                activate: this.onActivate,
                mouseenter: {
                    fn: function (d, e, g) {
                        var f = Ext.get(g);
                        if (f.hasClass(this.selectedClass)) {
                            f.removeClass(this.overClass)
                        }
                        var h = d.getRecord(g).get("id");
                        if (h === "console_title") {
                            f.removeClass(this.overClass)
                        }
                    }
                }
            }
        }, config);
        this.addEvents("onbeforeclick");
        PLATANUS.Skysync.ListView.superclass.constructor.call(this, config)
    },
    onBeforeClick: function (c, d, f, b) {
        var g = c.getRecord(f);
        var h = g.get("id");
        if (h === "console_title") {
            return false
        }
        if (false == this.fireEvent("onbeforeclick", this, d, f, b)) {
            return false
        }
        var e = this.module.cardPanel.getLayout();
        var a = e.activeItem.itemId;
        if (h === a) {
            return false
        }
        if (this.module.isPanelDirty(a)) {
            this.module.cardPanel.owner.getMsgBox().confirm(_T("app", "app_name"), _T("common", "confirm_lostchange"),
            function (i) {
                if ("yes" === i) {
                    this.module.panelDeactivate(a);
                    this.select(d)
                }
            }, this);
            return false
        }
        this.module.panelDeactivate(a);
        return true
    },
    onListSelect: function (b, a) {
        var c = this.getRecord(a[0]);
        this.module.switchPanel(c.get("id"))
    },
    onActivate: function (panel) {
        var a = this.getSelectedRecords()[0];
        if (!a) {
            this.select(1)
        }
    }
});

// Card panel
PLATANUS.Skysync.MainCardPanel = Ext.extend(Ext.Panel, {
    PanelParameters: null,
    constructor: function (config) {
        this.owner = config.owner;
        this.module = config.module;
        this.PanelParameters = new PLATANUS.Skysync.PanelParameters({
            owner: this.owner
        });
        this.PanelDirectories = new PLATANUS.Skysync.PanelDirectories({
            owner: this.owner
        });
        config = Ext.apply({
            activeItem: 0,
            layout: "card",
            items: [this.PanelParameters, this.PanelDirectories],
            border: false,
            listeners: {
                scope: this,
                activate: this.onActivate,
                deactivate: this.onDeactivate
            }
        }, config);
        PLATANUS.Skysync.MainCardPanel.superclass.constructor.call(this, config)
    },
    onActivate: function (panel) {
        if (this.PanelParameters) {
            this.PanelParameters.onActivate();
        }
    },
    onDeactivate: function (panel) {
        this.PanelParameters.onDeactivate();
    }
});

// FormPanel base
PLATANUS.Skysync.FormPanel = Ext.extend(Ext.FormPanel, {
    constructor: function (config) {
        config = Ext.apply({
            owner: null,
            items: [],
            padding: "20px 30px 2px 30px",
            border: false,
            header: false,
            trackResetOnLoad: true,
            monitorValid: true,
            fbar: {
                xtype: "statusbar",
                defaultText: "&nbsp;",
                statusAlign: "left",
                buttonAlign: "left",
                hideMode: "visibility",
                items: [{
                    text: _T("common", "commit"),
                    ctCls: "syno-sds-cp-btn",
                    scope: this,
                    handler: this.onApply
                }, {
                    text: _T("common", "reset"),
                    ctCls: "syno-sds-cp-btn",
                    scope: this,
                    handler: this.onReset
                }]
            }
        }, config);
        SYNO.LayoutConfig.fill(config);
        PLATANUS.Skysync.FormPanel.superclass.constructor.call(this, config);
        if (!this.owner instanceof SYNO.SDS.BaseWindow) {
            throw Error("please set the owner window of form");
        }
    },
    onActivate: Ext.emptyFn,
    onDeactivate: Ext.emptyFn,
    onApply: function () {
        if (!this.getForm().isDirty()) {
            this.owner.setStatusError({
                text: _T("error", "nochange_subject"),
                clear: true
            });
            return;
        }
        if (!this.getForm().isValid()) {
            this.owner.setStatusError({
                text: _T("common", "forminvalid"),
                clear: true
            });
            return;
        }
        return true;
    },
    onReset: function () {
        if (!this.getForm().isDirty()) {
            this.getForm().reset();
            return;
        }
        this.owner.getMsgBox().confirm(this.title, _T("common", "confirm_lostchange"),
        function (response) {
            if ("yes" === response) {
                this.getForm().reset();
            }
        }, this);
    }
});

// Parameters panel
PLATANUS.Skysync.PanelParameters = Ext.extend(PLATANUS.Skysync.FormPanel, {
    constructor: function (config) {
        this.owner = config.owner;
        this.loaded = false;
        config = Ext.apply({
            itemId: "parameters",
            items: [{
                xtype: "fieldset",
                labelWidth: 130,
                title: _V("ui", "general"),
                defaultType: "textfield",
                items: [{
                    xtype: "checkbox",
                    fieldLabel: _V("ui", "multi"),
                    name: "multi"
                }, {
                    xtype: "numberfield",
                    fieldLabel: _V("ui", "max_depth"),
                    name: "max_depth",
                    allowBlank: false,
                    allowDecimals: false,
                    allowNegative: false,
                    minValue: 1,
                    maxValue: 8
                }, {
                    xtype: "checkbox",
                    fieldLabel: _V("ui", "dsm_notifications"),
                    name: "dsm_notifications"
                }]
            }, {
                xtype: "fieldset",
                labelWidth: 130,
                title: _V("ui", "task"),
                defaultType: "textfield",
                items: [{
                    xtype: "checkbox",
                    fieldLabel: _V("ui", "enable"),
                    name: "task"
                }, {
                    xtype: "numberfield",
                    fieldLabel: _V("ui", "age"),
                    name: "age",
                    allowBlank: false,
                    allowDecimals: false,
                    allowNegative: false,
                    minValue: 3,
                    maxValue: 30
                }, {
                    xtype: "numberfield",
                    fieldLabel: _V("ui", "hour"),
                    name: "hour",
                    allowBlank: false,
                    allowDecimals: false,
                    allowNegative: false,
                    minValue: 0,
                    maxValue: 23
                }, {
                    xtype: "numberfield",
                    fieldLabel: _V("ui", "minute"),
                    name: "minute",
                    allowBlank: false,
                    allowDecimals: false,
                    allowNegative: false,
                    minValue: 0,
                    maxValue: 59
                }]
            }],
            api: {
                load: PLATANUS.Skysync.Remote.Subliminal.load,
                submit: PLATANUS.Skysync.Remote.Subliminal.save
            }
        }, config);
        PLATANUS.Skysync.PanelParameters.superclass.constructor.call(this, config);
    },
    onActivate: function () {
        if (!this.loaded) {
            this.loaded = true;
            this.getEl().mask(_T("common", "loading"), "x-mask-loading");
            this.load({
                scope: this,
                success: function (form, action) {
                    this.getEl().unmask();
                }
            });
        }
    },
    onApply: function () {
        if (!PLATANUS.Skysync.PanelParameters.superclass.onApply.apply(this, arguments)) {
            return false;
        }
        this.owner.setStatusBusy({
            text: _T("common", "saving")
        });
        this.getForm().submit({
            scope: this,
            success: function (form, action) {
                this.owner.clearStatusBusy();
                this.owner.setStatusOK();
                this.getForm().setValues(this.getForm().getFieldValues());
            }
        });
    }
});

// Directories panel
PLATANUS.Skysync.PanelDirectories = Ext.extend(Ext.grid.GridPanel, {
    constructor: function (config) {
        this.owner = config.owner;
        this.loaded = false;
        this.store = new Ext.data.DirectStore({
            autoSave: false,
            fields: ["id", "name", "path"],
            api: {
                read: PLATANUS.Skysync.Remote.Directories.read,
                create: PLATANUS.Skysync.Remote.Directories.create,
                update: PLATANUS.Skysync.Remote.Directories.update,
                destroy: PLATANUS.Skysync.Remote.Directories.destroy
            },
            idProperty: "id",
            root: "data",
            writer: new Ext.data.JsonWriter({
                encode: false,
                listful: true,
                writeAllFields: true
            })
        });
        config = Ext.apply({
            itemId: "directories",
            border: false,
            store: this.store,
            loadMask: true,
            tbar: {
                items: [{
                    text: _V("ui", "add"),
                    itemId: "add",
                    scope: this,
                    handler: this.onClickAdd
                }, {
                    text: _V("ui", "edit"),
                    itemId: "edit",
                    scope: this,
                    handler: this.onClickEdit
                }, {
                    text: _V("ui", "delete"),
                    itemId: "delete",
                    scope: this,
                    handler: this.onClickDelete
                }, {
                    text: _V("ui", "scan"),
                    itemId: "scan",
                    scope: this,
                    handler: this.onClickScan
                }]
            },
            columns: [{
                header: _V("ui", "name"),
                sortable: true,
                width: 40,
                dataIndex: "name"
            }, {
                header: _V("ui", "path"),
                dataIndex: "path"
            }]
        }, config);
        PLATANUS.Skysync.PanelDirectories.superclass.constructor.call(this, config);
    },
    onActivate: function () {
        if (!this.loaded) {
            this.store.load();
            this.loaded = true;
        }
    },
    onClickAdd: function () {
        var editor = new PLATANUS.Skysync.DirectoryEditorWindow({
            store: this.store,
            title: _V("ui", "directory_add")
        });
        editor.open();
    },
    onClickEdit: function () {
        var editor = new PLATANUS.Skysync.DirectoryEditorWindow({
            store: this.store,
            record: this.getSelectionModel().getSelected(),
            title: _V("ui", "directory_edit")
        });
        editor.open();
    },
    onClickDelete: function () {
        var records = this.getSelectionModel().getSelections();
        if (records.length != 0) {
            this.store.remove(this.getSelectionModel().getSelections());
            this.store.save();
        }
    },
    onClickScan: function () {
        this.getSelectionModel().each(function (record) {
            PLATANUS.Skysync.Remote.Directories.scan(record.id);
        });
    },
    onClickRefresh: function () {
        this.store.load();
    }
});

// Directory window
PLATANUS.Skysync.DirectoryEditorWindow = Ext.extend(SYNO.SDS.ModalWindow, {
    initComponent: function () {
        this.panel = new PLATANUS.Skysync.PanelDirectoryEditor();
        var config = {
            width: 450,
            height: 180,
            resizable: false,
            layout: "fit",
            items: [this.panel],
            listeners: {
                scope: this,
                afterrender: this.onAfterRender
            },
            buttons: [{
                text: _T("common", "apply"),
                scope: this,
                handler: this.onClickApply
            }, {
                text: _T("common", "close"),
                scope: this,
                handler: this.onClickClose
            }]
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        PLATANUS.Skysync.DirectoryEditorWindow.superclass.initComponent.apply(this, arguments);
    },
    onAfterRender: function () {
        if (this.record) {
            this.panel.loadRecord(this.record);
        }
    },
    onClickApply: function () {
        if (this.record === undefined) {
            var record = new this.store.recordType({
                name: this.panel.getForm().findField("name").getValue(),
                path: this.panel.getForm().findField("path").getValue()
            });
            this.store.add(record);
        } else {
            this.record.beginEdit();
            this.record.set("name", this.panel.getForm().findField("name").getValue());
            this.record.set("path", this.panel.getForm().findField("path").getValue());
            this.record.endEdit();
        }
        this.store.save();
        this.close();
    },
    onClickClose: function () {
        this.close();
    }
});

// Directory panel
PLATANUS.Skysync.PanelDirectoryEditor = Ext.extend(PLATANUS.Skysync.FormPanel, {
    initComponent: function () {
        var config = {
            itemId: "directory",
            padding: "15px 15px 2px 15px",
            defaultType: "textfield",
            labelWidth: 130,
            fbar: null,
            defaults: {
                anchor: "-20"
            },
            items: [{
                fieldLabel: _V("ui", "name"),
                name: "name"
            }, {
                xtype: "compositefield",
                fieldLabel: _V("ui", "path"),
                items: [{
                    xtype: "textfield",
                    name: "path",
                    readOnly: true
                }, {
                    xtype: "button",
                    id: "platanus-subliminal-browse",
                    text: _V("browser", "browse"),
                    handler: this.onClickBrowse,
                    scope: this
                }]
            }]
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        PLATANUS.Skysync.PanelDirectoryEditor.superclass.initComponent.apply(this, arguments);
    },
    loadRecord: function (record) {
        this.getForm().findField("name").setValue(record.data.name);
        this.getForm().findField("path").setValue(record.data.path);
    },
    onClickBrowse: function (button, event) {
        var browser = new PLATANUS.Skysync.BrowserWindow({});
        browser.mon(browser, "apply",
        function (selectionModel) {
            this.getForm().findField("path").setValue(selectionModel.getSelectedNode().attributes.path);
        }, this);
        browser.open();
    }
});

// Folder browser window
PLATANUS.Skysync.BrowserWindow = Ext.extend(SYNO.SDS.ModalWindow, {
    initComponent: function () {
        this.panel = new Ext.tree.TreePanel({
            loader: {
                dataUrl: "/webman/modules/FileBrowser/webfm/webUI/file_share.cgi",
                baseParams: {
                    action: "getshares",
                    needrw: "false",
                    bldisableist: "true"
                }
            },
            autoScroll: true,
            animate: false,
            useArrows: true,
            trackMouseOver: false,
            border: false,
            root: {
                id: "fm_root",
                text: _S("hostname"),
                draggable: false,
                expanded: true,
                allowDrop: false,
                icon: "/webman/modules/FileBrowser/webfm/images/button/my_ds.png",
                cls: "root_node"
            },
            listeners: {
                scope: this,
                beforeload: function () {
                    this.setStatusBusy();
                },
                load: function () {
                    this.clearStatusBusy();
                }
            }
        });
        var config = {
            title: _V("browser", "title"),
            width: 450,
            height: 500,
            layout: "fit",
            items: [this.panel],
            buttons: [{
                text: _T("common", "apply"),
                scope: this,
                handler: this.onClickApply
            }, {
                text: _T("common", "cancel"),
                scope: this,
                handler: this.onClickCancel
            }]
        };
        Ext.apply(this, Ext.apply(this.initialConfig, config));
        this.addEvents("apply", "cancel");
        PLATANUS.Skysync.BrowserWindow.superclass.initComponent.apply(this, arguments);
    },
    onClickApply: function () {
        this.fireEvent("apply", this.panel.getSelectionModel());
        this.close();
    },
    onClickCancel: function () {
        this.fireEvent("cancel");
        this.close();
    }
});