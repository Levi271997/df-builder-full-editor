/**
 * `dfb/builder` data store: global classes + panel UI state (current breakpoint/state).
 */
import apiFetch from '@wordpress/api-fetch';
import { createReduxStore, register, createSelector } from '@wordpress/data';

export const STORE = 'dfb/builder';

const DEFAULT_STATE = {
	classes: {},
	order: [],
	dirty: {},
	editState: 'base',
};

function reducer( state = DEFAULT_STATE, action ) {
	switch ( action.type ) {
		case 'RECEIVE_CLASSES': {
			const classes = {};
			const order = [];
			for ( const c of action.classes ) {
				classes[ c.id ] = c;
				order.push( c.id );
			}
			return { ...state, classes, order, dirty: {} };
		}
		case 'RECEIVE_CLASS': {
			const exists = !! state.classes[ action.cls.id ];
			const dirty = { ...state.dirty };
			delete dirty[ action.cls.id ];
			return {
				...state,
				classes: { ...state.classes, [ action.cls.id ]: action.cls },
				order: exists ? state.order : [ ...state.order, action.cls.id ],
				dirty,
			};
		}
		case 'SET_CLASS_STYLES':
			if ( ! state.classes[ action.id ] ) {
				return state;
			}
			return {
				...state,
				classes: {
					...state.classes,
					[ action.id ]: {
						...state.classes[ action.id ],
						styles: action.styles,
					},
				},
				dirty: { ...state.dirty, [ action.id ]: true },
			};
		case 'REMOVE_CLASS': {
			const classes = { ...state.classes };
			delete classes[ action.id ];
			const dirty = { ...state.dirty };
			delete dirty[ action.id ];
			return {
				...state,
				classes,
				dirty,
				order: state.order.filter( ( id ) => id !== action.id ),
			};
		}
		case 'SET_EDIT_STATE':
			return { ...state, editState: action.editState };
	}
	return state;
}

const actions = {
	receiveClasses: ( classes ) => ( { type: 'RECEIVE_CLASSES', classes } ),
	receiveClass: ( cls ) => ( { type: 'RECEIVE_CLASS', cls } ),
	setClassStyles: ( id, styles ) => ( {
		type: 'SET_CLASS_STYLES',
		id,
		styles,
	} ),
	setEditState: ( editState ) => ( { type: 'SET_EDIT_STATE', editState } ),

	createClass:
		( name, styles = {} ) =>
		async ( { dispatch } ) => {
			const cls = await apiFetch( {
				path: '/dfb/v1/classes',
				method: 'POST',
				data: { name, styles },
			} );
			dispatch.receiveClass( cls );
			return cls;
		},

	renameClass:
		( id, name ) =>
		async ( { dispatch } ) => {
			const cls = await apiFetch( {
				path: `/dfb/v1/classes/${ id }`,
				method: 'PUT',
				data: { name },
			} );
			dispatch.receiveClass( cls );
			return cls;
		},

	saveClass:
		( id ) =>
		async ( { select, dispatch } ) => {
			const cls = select.getClass( id );
			if ( ! cls ) {
				return;
			}
			const saved = await apiFetch( {
				path: `/dfb/v1/classes/${ id }`,
				method: 'PUT',
				data: { styles: cls.styles || {} },
			} );
			dispatch.receiveClass( saved );
		},

	saveDirtyClasses:
		() =>
		async ( { select, dispatch } ) => {
			await Promise.all(
				select
					.getDirtyClassIds()
					.map( ( id ) => dispatch.saveClass( id ) )
			);
		},

	deleteClass:
		( id ) =>
		async ( { dispatch } ) => {
			await apiFetch( {
				path: `/dfb/v1/classes/${ id }`,
				method: 'DELETE',
			} );
			dispatch( { type: 'REMOVE_CLASS', id } );
		},
};

const selectors = {
	getClasses: createSelector(
		( state ) => state.order.map( ( id ) => state.classes[ id ] ),
		( state ) => [ state.order, state.classes ]
	),
	getClass: ( state, id ) => state.classes[ id ],
	getClassNames: ( state, ids = [] ) =>
		ids
			.map( ( id ) => state.classes[ id ]?.name )
			.filter( Boolean )
			.join( ' ' ),
	isClassDirty: ( state, id ) => !! state.dirty[ id ],
	getDirtyClassIds: createSelector(
		( state ) => Object.keys( state.dirty ),
		( state ) => [ state.dirty ]
	),
	getEditState: ( state ) => state.editState,
};

const resolvers = {
	getClasses:
		() =>
		async ( { dispatch } ) => {
			const classes = await apiFetch( { path: '/dfb/v1/classes' } );
			dispatch.receiveClasses( Array.isArray( classes ) ? classes : [] );
		},
};
// Other class selectors rely on getClasses having resolved; index.js triggers it on load.

export const store = createReduxStore( STORE, {
	reducer,
	actions,
	selectors,
	resolvers,
} );

register( store );
