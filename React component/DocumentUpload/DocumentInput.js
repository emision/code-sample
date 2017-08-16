/* eslint-disable css-modules/no-unused-class */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import s from './style.css';
import Select from '../Select';

import * as FilesActions from '../../actions/files';


class DocumentInput extends React.Component {

    static propTypes = {
        fileTypeList: PropTypes.arrayOf(PropTypes.shape()).isRequired,
        index: PropTypes.number.isRequired,
        as: PropTypes.string,
        addFile: PropTypes.func.isRequired,
        files: PropTypes.arrayOf(PropTypes.shape()).isRequired,
        deleteFile: PropTypes.func.isRequired,
    };

    static defaultProps = {
        as: 'url',
    };

    constructor(props) {
        super(props);

        this.onFileTypeSelect = this.onFileTypeSelect.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    state = {
        selectedType: null,
    };

    onFileTypeSelect(e) {
        e.preventDefault();
        this.setState({
            selectedType: e.target.value,
        });
    }

    uploadFile(e) {
        e.preventDefault();
        // Manual trigger hidden input
        this.input.click();
    }

    handleChange = (e) => {
        const { addFile, index } = this.props;
        const files = [];
        for (let i = 0; i < e.target.files.length; i += 1) {
            // Convert to Array.
            files.push(e.target.files[i]);
        }

        // Build Promise List, each promise resolved by FileReader.onload.
        Promise.all(files.map(file => new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (result) => {
                // Resolve both the FileReader result and its original file.
                resolve([result, file]);
            };

            reader.onerror = (error) => {
                reject([error, file]);
            };

            // Read the file with format based on this.props.as.
            switch ((this.props.as || 'url').toLowerCase()) {
            case 'binary': {
                reader.readAsBinaryString(file);
                break;
            }
            case 'buffer': {
                reader.readAsArrayBuffer(file);
                break;
            }
            case 'text': {
                reader.readAsText(file);
                break;
            }
            case 'url':
            default: {
                reader.readAsDataURL(file);
                break;
            }
            }
        })))
            .then((zippedResults) => {
                // Hardcode for only single file support
                const { name, size, type } = zippedResults[0][1];

                const newFile = {
                    data: zippedResults[0][0].target.result,
                    fileInfo: {
                        name,
                        size,
                        type,
                    },
                    type: this.state.selectedType,
                };
                // Run the callback after file have been read.
                addFile(newFile, index);
            });
    };


    render() {
        const { fileTypeList, files, index, deleteFile } = this.props;

        if (files[index]) {
            const currentFileType = fileTypeList.find(item => item._id === files[index].type);
            return (<div className={s.addedFile}>
                <span className={s.typeTitle}>
                    {currentFileType.title}
                </span>
                <span className={s.nameTitle}>
                    {files[index].fileInfo.name}
                </span>
                <span className={s.sizeTitle}>
                    {Math.round(files[index].fileInfo.size / 1024)} kb
                </span>
                <span
                    role="link"
                    tabIndex={0}
                    onClick={() => deleteFile(index)}
                    className={s.delete}
                />
            </div>);
        }
        return (
            <div className={s.wrp} >
                <Select
                    classNames={{
                        select: s.select,
                        label: s.label,
                        wrp: s.selectWrp,
                    }}
                    action={this.onFileTypeSelect}
                    label="Тип документа"
                    name="documentType"
                    list={fileTypeList}
                />
                <input
                    ref={node => (this.input = node)}
                    className={s.input}
                    type="file"
                    name={`file${this.props.index}`}
                    onChange={this.handleChange}
                />
                <button
                    onClick={this.uploadFile}
                    className={s.button}
                >
                    Прикрепить
                </button>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    fileTypeList: state.lists.documentTypes,
    files: state.files,
});

const mapDispatchToProps = dispatch => ({
    ...bindActionCreators(FilesActions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(DocumentInput);
