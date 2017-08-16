/* eslint-disable import/prefer-default-export */
import {
    SUBMIT_FILES,
    SUBMIT_FILES_SUCCESS,
    SUBMIT_FILES_REJECT,
    ADD_FILE,
    FILES_CLEAR,
    DELETE_FILE,
} from '../constants';

import history from '../history';

export function addFile(file, index) {
    return {
        type: ADD_FILE,
        file,
        index,
    };
}

function submitFilesSuccess() {
    return {
        type: SUBMIT_FILES_SUCCESS,
    };
}

function submitFileReject() {
    return {
        type: SUBMIT_FILES_REJECT,
    };
}

function submitFileRequest() {
    return {
        type: SUBMIT_FILES,
    };
}

export function clearFiles() {
    return {
        type: FILES_CLEAR,
    };
}

export function deleteFile(index) {
    return {
        type: DELETE_FILE,
        index,
    };
}

export function submitFiles(files, id, fetch) {
    return (dispatch) => {
        dispatch(submitFileRequest());
        fetch(`/api/v1.0/files/${id}`, {
            method: 'POST',
            body: JSON.stringify(files),
        })
            .then(response => response.json())
            .then((json) => {
                dispatch(submitFilesSuccess(json));
                history.push(`/patients/${json._id}`);
            })
            .catch(error => dispatch(submitFileReject(error)));
    };
}
