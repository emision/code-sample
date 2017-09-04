import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import cx from 'classname';
import Floors from '../Floors';
import s from './index.scss';
import { plus, minus } from './additional';
import Point from '../Point';
import here from './youAreHere.png';
import preloader from './preloader.svg';

class Map extends Component {

    static propTypes = {
        selectedPoints: PropTypes.arrayOf(PropTypes.shape()),
        selectedDepartment: PropTypes.number.isRequired,
        mode: PropTypes.string.isRequired,
        svg: PropTypes.shape().isRequired,
        paths: PropTypes.shape({
            cabinet: PropTypes.shape(),
            from: PropTypes.arrayOf(PropTypes.shape()),
            to: PropTypes.arrayOf(PropTypes.shape()),
            fromStartPoint: PropTypes.shape(),
            fromEndPoint: PropTypes.shape(),
            toStartPoint: PropTypes.shape(),
            toEndPoint: PropTypes.shape(),
            fromFloor: PropTypes.number,
            toFloor: PropTypes.number,
        }).isRequired,
        selectedFloor: PropTypes.number.isRequired,
        preload: PropTypes.bool,
    };

    static defaultProps = {
        selectedPoints: [],
        preload: false,
    };

    constructor(props) {
        super(props);
        this.initSchema = this.initSchema.bind(this);
        this.onZoomIn = this.onZoomIn.bind(this);
        this.onZoomOut = this.onZoomOut.bind(this);
        this.initListeners = this.initListeners.bind(this);

        this._onEditorMouseMove = this._onEditorMouseMove.bind(this);
        this._onEditorMouseDown = this._onEditorMouseDown.bind(this);
        this._onEditorMouseUp = this._onEditorMouseUp.bind(this);
    }

    state = {
        scale: 0.6,
        left: 0,
        top: -250,
    };

    componentDidMount() {
        this.initSchema(this.props.svg);
        this.initListeners();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.svg) {
            this.initSchema(nextProps.svg);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('touchend', this._onEditorMouseUp);
        this.editor.removeEventListener('touchstart', this._onEditorMouseDown);
        this.editor.removeEventListener('touchmove', this._onEditorMouseMove);
    }

    initListeners() {
        document.addEventListener('touchend', this._onEditorMouseUp);
        this.editor.addEventListener('touchstart', this._onEditorMouseDown);
    }

    initSchema(svg) {
        if (this.schemaSvg) {
            this.schemaSvg.remove();
            this.schemaSvg = false;
        }
        this.schemaSvg = svg;
        this.schemaSvg.removeAttribute('width');
        this.schemaSvg.removeAttribute('height');
        this.schemaWrapper.insertBefore(svg, this.schemaWrapper.firstChild);
    }

    onZoomIn() {
        let scale = ((this.state.scale * 10) + 3) / 10;
        if (scale > 3) scale = 3;
        this.setState({
            scale
        });
    }

    onZoomOut() {
        let scale = ((this.state.scale * 10) - 3) / 10;
        if (scale < 0.6) scale = 0.6;
        this.setState({
            scale
        });
    }

    _onEditorMouseDown(event) {
        const e = event.targetTouches[0];
        this.downX = e.screenX;
        this.downY = e.screenY;
        this.oldX = parseInt(this.schemaWrapper.style.left, 10) || 0;
        this.oldY = parseInt(this.schemaWrapper.style.top, 10) || 0;

        this.editor.addEventListener('touchmove', this._onEditorMouseMove);
    }

    _onEditorMouseMove(event) {
        const e = event.targetTouches[0];
        this.moveTimer = setTimeout(() => {
            this.schemaWrapper.style.top = `${this.oldY + (e.screenY - this.downY)}px`;
            this.schemaWrapper.style.left = `${this.oldX + (e.screenX - this.downX)}px`;
        }, 100);
    }

    _onEditorMouseUp() {
        delete this.downX;
        delete this.downY;
        delete this.oldX;
        delete this.oldY;

        this.setState({
            left: parseInt(this.schemaWrapper.style.left, 10),
            top: parseInt(this.schemaWrapper.style.top, 10),
        });
        this.editor.removeEventListener('touchmove', this._onEditorMouseMove);
    }

    render() {
        const { scale } = this.state;
        const {
            selectedPoints,
            selectedDepartment,
            mode,
            paths,
            selectedFloor,
            preload,
        } = this.props;

        const {
            cabinet: targetRoom,
            from,
            to,
            fromStartPoint,
            fromEndPoint,
            toStartPoint,
            toEndPoint,
            fromFloor,
            toFloor,
        } = paths;

        let errorSearchBlock = '';
        if (from === null && to === null && selectedPoints.length < 1) {
            errorSearchBlock = (
                <div className={s.searchError} > Извините, не удалось проложить маршрут </div >
            );
        }

        const schemaWrpStyles = {
            transform: `scale(${scale})`,
            left: `${this.state.left}px`,
            top: `${this.state.top}px`,
        };

        const departmentClass = mode === 'dep' ? `d${selectedDepartment}` : '';
        const lineStyle = {
            stroke: 'rgb(141,20,94)',
            strokeWidth: 2,
            fill: 'none',
        };
        let points = '';
        let pointsStart = false;
        let pointsLast = false;

        if (selectedFloor === fromFloor && from !== null) {
            from.forEach(item => {
                points += `${item.x},${item.y} `;
            });
            pointsStart = (<image
                x={parseFloat(fromStartPoint.x, 10) - 15}
                y={parseFloat(fromStartPoint.y, 10) - 10}
                xlinkHref={here}
            />);
            if (toFloor) {
                pointsLast = (<Point key={fromEndPoint._id} {...fromEndPoint} />);
            } else {
                pointsLast = (<svg
                    className={s.endPoint}
                    x={parseFloat(fromEndPoint.x, 10) - 35}
                    y={parseFloat(fromEndPoint.y, 10) - 75}
                    width="70px"
                    height="75px"
                    viewBox="0 0 70 75"
                >
                    <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" >
                        <polyline
                            id="Path"
                            fill="#8D145E"
                            points="0 0 0 67.0671734 29.2806927 67.0671734 35 75 40.3962333 67.0671734 70 67.0087992 70 2.0400061e-16"
                        />
                        <text x="35" textAnchor="middle" fontSize="16" fontWeight="normal" >
                            <tspan y="27" fill="#FFFFFF" >{targetRoom.section}</tspan >
                        </text >
                        <text x="35" textAnchor="middle" fontSize="16" fontWeight="normal" >
                            <tspan y="49" fill="#FFFFFF" >{targetRoom.number}</tspan >
                        </text >
                    </g >
                </svg >);
            }
        }

        if (selectedFloor === toFloor && to !== null) {
            to.forEach(item => {
                points += `${item.x},${item.y} `;
            });
            pointsStart = <Point key={toStartPoint._id} {...toStartPoint} />;
            pointsLast = (<svg
                className={s.endPoint}
                x={toEndPoint.x - 35}
                y={toEndPoint.y - 75}
                width="70px"
                height="75px"
                viewBox="0 0 70 75"
            >
                <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd" >
                    <polyline
                        id="Path"
                        fill="#8D145E"
                        points="0 0 0 67.0671734 29.2806927 67.0671734 35 75 40.3962333 67.0671734 70 67.0087992 70 2.0400061e-16"
                    />
                    <text x="35" textAnchor="middle" fontSize="16" fontWeight="normal" >
                        <tspan y="27" fill="#FFFFFF" >{targetRoom.section}</tspan >
                    </text >
                    <text x="35" textAnchor="middle" fontSize="16" fontWeight="normal" >
                        <tspan y="49" fill="#FFFFFF" >{targetRoom.number}</tspan >
                    </text >
                </g >
            </svg >);
        }

        const visibleMapClass = preload ? 'noVisible' : '';
        const visiblePreloaderClass = preload ? '' : 'noVisible';

        return (
            <div className={s.map} >
                {errorSearchBlock}
                <div className={s.sidebar} >
                    <Floors />
                </div >
                <div className={cx(s.content, s[visiblePreloaderClass], s.preloader)} >
                    <img src={preloader} alt="Loading..." />
                </div >
                <div className={cx(s.content, s[visibleMapClass])} >
                    <div
                        ref={node => (this.editor = node)}
                        className={s.editor}
                    >
                        <div
                            style={schemaWrpStyles}
                            className={cx(s.wrp, departmentClass)}
                            ref={node => (this.schemaWrapper = node)}
                        >
                            <div className={s.pointsLayer} >
                                {selectedPoints.map(point => <Point key={point._id} {...point} />)}
                                {selectedFloor === toFloor ? pointsStart : null}
                                {selectedFloor === fromFloor && toFloor ? pointsLast : null}
                            </div >
                            <svg className={s.route} >
                                <polyline points={points} style={lineStyle} />
                                {selectedFloor === fromFloor ? pointsStart : null}
                                {(selectedFloor === toFloor || (selectedFloor === fromFloor && !toFloor))
                                    ? pointsLast : null}
                            </svg >
                        </div >
                    </div >
                    <div className={s.scale} >
                        <div
                            onClick={this.onZoomIn}
                            className={s.icon}
                        >
                            <img
                                src={plus}
                                alt="+"
                            />
                        </div >
                        <div
                            onClick={this.onZoomOut}
                            className={s.icon}
                        >
                            <img
                                src={minus}
                                alt="-"
                            />
                        </div >
                    </div >
                </div >
            </div >
        );
    }
}

function mapStateToProps(state) {
    const selectedFloor = state.map.selectedFloor;
    const selectedPoints = state.categories.points;
    return {
        selectedPoints: selectedPoints.filter(point => point.floor === selectedFloor),
        selectedDepartment: state.departments,
        selectedFloor,
        mode: state.map.mode,
        svg: state.map.svg,
        preload: state.map.preload,
        terminal: state.entities.terminal
    };
}

export default connect(mapStateToProps)(Map);
