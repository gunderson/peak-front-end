var _ = require( 'lodash' );
var $ = require( 'jquery' );
var TASK = require( '_TASK/Base' );

class View extends TASK {
	constructor( options ) {
		super( _.mergeWith( {
			// ---------------------------------------------------
			// Local Properties

			el: undefined,
			model: undefined,
			template: '',
			id: '',
			tagname: 'div',
			classname: '',
			// hasRendered: false,
			loadPromise: undefined,
			parentView: undefined,
			hasRendered: false,

			// ---------------------------------------------------
			// Child Views

			views: {
				/*
					'childView0': new ChildView0({
						el: '#child-id-0',
						model: this.model.widgets.at(0)
					}),
					'childView1': new ChildView1({
						el: '#child-id-1',
						model: this.model.widgets.at(1)
					}), ...
				*/
			},

			// ---------------------------------------------------
			// Event Listeners

			events: [
				/*
				{
					eventName: 'click',
					target: 'objectName', // relative to this
					selector: 'button.play',
					handler: 'handleButtonClick'
				}
				*/
			],

			// ---------------------------------------------------
			// Data Binding

			dataBindings: [
				/*
				{
					element: '.selector',
					attributeName: 'attr',
					model: 'model',
					elementChangeEventName: 'change',
					mode: 'get' || 'send'
				}
				*/
			],

			// ---------------------------------------------------
			// Function Scope Binding

			bindFunctions: [
				'bindData',
				'delegateEvents',
				'destroy',
				'undelegateEvents',
				'updateDOM',
				'render',
				'setupElement',
				'onResize'
			]
		}, options, View.mergeRules ) );

		// ---------------------------------------------------
		// Finish setup

		this.parseName( this.options );
		this.domUpdates = [];
	}

	// ---------------------------------------------------

	static getTemplate( name ) {
		// TEMPLATES is a global object on window
		return name ? TEMPLATES[ name ] : () => '';
	}

	// ---------------------------------------------------

	parseName( options ) {
		if ( options.name ) {
			if ( !options.el ) this.el = options.el = '.' + options.name;
		}
		return options;
	}

	// ---------------------------------------------------

	getView( name ) {
		return _.find( this.views, {
			name: name
		} );
	}

	// ---------------------------------------------------

	onResize() {
		// override me
	}

	// ---------------------------------------------------

	beforeRender() {
		// override me

	}

	// ---------------------------------------------------

	afterRender() {
		// override me
	}

	// ---------------------------------------------------

	setupElement() {
		// if an el property exists, attempt to find it
		// otherwise, create one

		this.$el = this.parentView.$( this.el )
			.first() ||
			$( this.el )
			.first() ||
			$( `<${this.tagname} class='${this.classname}' id='${this.id}' />` );
		this.el = this.$el[ 0 ];
		this.$ = this.$el.find.bind( this.$el );
	}

	// ---------------------------------------------------

	render( parentView ) {
		this.hasRendered = false;
		this.parentView = parentView || this.parentView || window;
		this.setupElement();
		this.undelegateEvents();
		this.unbindData();
		this.beforeRender();
		this.trigger( 'beforeRender', this );

		// put rendered JST template into $el
		if ( this.template ) {
			var html = View.getTemplate( this.template )( this.serialize() );
			this.$el.html( html );
		}
		// render child views
		_.each( this.views, ( v ) => v.render( this ) );
		this.onResize();

		this.delegateEvents();
		this.bindData();
		this.afterRender();
		this.trigger( 'afterRender', this );
		this.hasRendered = true;
	}

	// ---------------------------------------------------
	// bind the value of an HTMLElement to a model or collection

	createDataBinding( hash ) {
		let attributeName = hash.attributeName;
		let element = hash.element;
		let model = hash.model;
		let elementChangeEventName = hash.elementChangeEventName;
		let mode = hash.mode;

		// parse argument options
		let $element = $( element );
		model = model || this[ model ] || this.model;
		elementChangeEventName = elementChangeEventName || 'change';

		// set listeners
		if ( mode !== 'send' ) this.listenTo( model, `change:${attributeName}`, updateElement );
		if ( mode !== 'get' ) $element.on( elementChangeEventName, updateModel );

		// assign a destroy function for convenient destruction
		hash.unbindData = unbindData.bind( hash );

		return hash;

		// TODO document get/setElementData

		function updateElement( event ) {
			let fn = hash.setElementData || ( () => $element.val( event.value ) );
			this.domUpdates.push( fn );
			if ( !this.domUpdateRequest ) {
				this.domUpdateRequest = requestAnimationFrame( this.updateDOM );
			}
		}

		function updateModel( event ) {
			model[ attributeName ] = hash.getElementData || $element.val();
		}

		function unbindData() {
			this.stopListening( model, `change:${attributeName}`, updateElement );
			$element.off( elementChangeEventName, updateModel );
			delete this.unbindData;
		}
	}

	// ---------------------------------------------------

	bindData() {
		_.each( this.dataBindings, this.createDataBinding );
		return this;
	}

	// ---------------------------------------------------

	unbindData() {
		_.each( this.dataBindings, ( hash ) => hash.unbindData && hash.unbindData() );
		return this;
	}

	// ---------------------------------------------------
	// batch DOM updates

	updateDOM() {
		this.domUpdateRequest = null;
		this.domUpdates.foreach( ( fn ) => {
			fn();
		} );
	}

	// ---------------------------------------------------

	delegateEvents() {
		// FIXME: this is a pass-through to translate old code from using selector to use target
		_( this.options.events )
			.filter( ( e ) => e.selector )
			.each( ( e ) => {
				e.target = e.selector;
			} );
		super.delegateEvents();
		return this;
	}

	// ---------------------------------------------------

	undelegateEvents() {
		_( this.options.events )
			.filter( ( e ) => e.selector )
			.each( ( e ) => {
				e.target = e.selector;
			} );
		super.undelegateEvents();
		return this;
	}

	// ---------------------------------------------------

	destroy() {
		this.unbindData();
		this.undelegateEvents();
		this.stopListening();
		_.each( this.views, ( v ) => v.destroy() );
	}

	// ---------------------------------------------------

	serialize() {
		var model = this.model ? this.model.attributes : {};
		return _.extend( {
			// "this.env" is a property of all TASK objects
			env: this.env
		}, model );
	}

	// ---------------------------------------------------

	$( selector ) {
		return this.$el ? this.$el.find( selector ) : $( selector );
	}

	// ---------------------------------------------------

	static mergeRules( objValue, srcValue ) {
		if ( _.isArray( objValue ) ) {
			if ( objValue.length && objValue[ 0 ] instanceof View ) return objValue;
			return objValue.concat( srcValue );
		}
	}
}

module.exports = View;
