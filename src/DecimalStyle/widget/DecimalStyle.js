define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",
    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",

    "dojo/text!DecimalStyle/widget/template/DecimalStyle.html"
], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent, widgetTemplate) {
    "use strict";

    return declare("DecimalStyle.widget.DecimalStyle", [ _WidgetBase, _TemplatedMixin ], {

        templateString: widgetTemplate,


        widgetBase: null,
		
		//nodes
		beforeNode: null,
		decimalNode: null,
		afterNode: null,
		
		//modeler
		field: null,
		beforeClassname: null,
		afterClassname: null,
		onclickMicroflow: null,


        // Internal variables.
        _handles: null,
        _contextObj: null,

        constructor: function () {
            this._handles = [];
        },

        postCreate: function () {
            logger.debug(this.id + ".postCreate");
			this._setupEvents();
        },

        update: function (obj, callback) {
            logger.debug(this.id + ".update");
            this._contextObj = obj;
			this._resetSubscriptions();
			this._updateRendering(callback);
        },
		
		_resetSubscriptions: function() {
			this.unsubscribeAll();
			//add an attr subscription
			this.subscribe({
				guid: this._contextObj.getGuid(),
				attr: this.field,
				callback: function() {
					this._updateRendering();
				}
			});
		},

        resize: function (box) {
            logger.debug(this.id + ".resize");
        },

        uninitialize: function () {
            logger.debug(this.id + ".uninitialize");
        },

        _updateRendering: function (callback) {
            logger.debug(this.id + "._updateRendering");
			
			var value = "" + this._contextObj.get(this.field) * 1; //19.92
			var splitValues = value.split("."); //19,99
			this.beforeNode.innerHTML = splitValues[0];
			this.afterNode.innerHTML = splitValues[1];
			this.beforeNode.className += " " + this.beforeClassname;
			this.afterNode.className += " " + this.afterClassname;
            //this._updateRendering(callback);

            if (this._contextObj !== null) {
                dojoStyle.set(this.domNode, "display", "block");
            } else {
                dojoStyle.set(this.domNode, "display", "none");
            }

            this._executeCallback(callback, "_updateRendering");
        },
		
		_setupEvents: function() {
			this.connect(this.widgetBase, "onclick", function() { 
				mx.data.action({
					params: {
						applyto: "selection",
						actionname: this.onclickMicroflow,
						guids: [this._contextObj.getGuid()]
					},
					origin: this.mxform,
					callback: function(obj) {
						// expect single MxObject
						console.log("Microflow ran successfully");
					},
					error: function(error) {
						console.log(error.message);
					}
				});
			});
		},

        // Shorthand for running a microflow
        _execMf: function (mf, guid, cb) {
            logger.debug(this.id + "._execMf");
            if (mf && guid) {
                mx.ui.action(mf, {
                    params: {
                        applyto: "selection",
                        guids: [guid]
                    },
                    callback: lang.hitch(this, function (objs) {
                        if (cb && typeof cb === "function") {
                            cb(objs);
                        }
                    }),
                    error: function (error) {
                        console.debug(error.description);
                    }
                }, this);
            }
        },

        // Shorthand for executing a callback, adds logging to your inspector
        _executeCallback: function (cb, from) {
            logger.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});

require(["DecimalStyle/widget/DecimalStyle"]);
