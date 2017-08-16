import {
    ADD_FILE,
    // SUBMIT_FILES,
    SUBMIT_FILES_SUCCESS,
    // SUBMIT_FILES_REJECT,
    FILES_CLEAR,
    DELETE_FILE,
} from '../constants';

const initialState = [];

export default function files(state = initialState, action) {
    switch (action.type) {
    case ADD_FILE:
        return [
            ...state.slice(0, action.index),
            action.file,
            ...state.slice(action.index + 1),
        ];
    case DELETE_FILE: {
        return [
            ...state.slice(0, action.index),
            ...state.slice(action.index + 1),
        ];
    }
    case SUBMIT_FILES_SUCCESS:
    case FILES_CLEAR:
        return [];
    default:
        return state;
    }
}
