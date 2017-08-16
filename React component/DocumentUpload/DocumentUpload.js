/* eslint-disable css-modules/no-unused-class */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import DocumentInput from './DocumentInput';

import s from './style.css';

const DocumentUpload = ({ length }) => {
    const inputs = [];
    for (let i = 0; i < length + 1; i += 1) {
        inputs.push(<DocumentInput index={i} key={i} />);
    }
    return (
        <div className={s.root} >
            <h3 className={s.title} >Прикрепление документов:</h3 >
            {inputs}
        </div >
    );
};

DocumentUpload.propTypes = {
    length: PropTypes.number.isRequired,
};

const mapStateToProps = ({ files }) => ({
    length: files.length,
});

export default connect(mapStateToProps)(withStyles(s)(DocumentUpload));
