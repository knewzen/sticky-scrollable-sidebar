import React, {Component} from 'react';
import PropTypes from 'prop-types'
import Keymirror from 'keymirror';

const STATES = Keymirror({
    DEFAULT: null,
    REACHED_BOTTOM: null,
    SCROLLING_UP: null,
    SCROLLING_DOWN: null,
    REACHED_TOP: null
});

function getPositionOfElement(element) {
    let $el = document
        .querySelector(element);
    return $el ? $el.getBoundingClientRect() : {};
}

function getDistanceBetweenPageBoundryAndWindow() {
    let page_height = document.documentElement.clientHeight;
    let page_position = getPositionOfElement('.js-page');
    return page_height - page_position.bottom;
}

class ScrollableSticky extends Component {
    constructor (props) {
        super(props);
        this.state = {
            state: STATES.DEFAULT,
            scrolling: null,
            position: 'relative',
            bottom: 0,
            top: 'auto'
        };

        this.recomputeState = this.recomputeState.bind(this);
    }

    componentDidMount() {
        this.ORIGINAL_CONTAINER_TOP_POSITION = this.getPositionOfContainer().top;
        this.FIXED_HEADER_HEIGHT = getPositionOfElement('.js-rb-page-header').height;
        this.MIN_HEIGHT_CONTAINER = this.getMinHightForContainer();
        if (this.props.disabled) return;
        this.requestAnimationFrame();
    }

    componentWillUnmount() {
        window.cancelAnimationFrame(this.animation_frame);
    }

    getMinHightForContainer() {
        return document.documentElement.clientHeight - (this.FIXED_HEADER_HEIGHT);
    }

    getPositionOfContainer() {
        return this.container.getBoundingClientRect();
    }

    getScrollState() {
        const scroll_direction = this.getScrollingDirection();
        const is_scrolling_up = scroll_direction === 'up';
        const is_scrolling_down = scroll_direction === 'down';
        const container_boundry = this.getPositionOfContainer();
        const {state} = this.state;
        const left_side_height = getPositionOfElement('.js-page--left').height;

        if (left_side_height < container_boundry.height) {
            return STATES.DEFAULT;
        }

        if (window.scrollY <= 157)
            return STATES.DEFAULT;

        if (container_boundry.height < this.MIN_HEIGHT_CONTAINER) {
            return STATES.REACHED_TOP;
        }

        // REACHED_BOTTOM
        if (state === STATES.REACHED_BOTTOM) {
            if (is_scrolling_up) {
                return STATES.SCROLLING_UP;
            }

            return STATES.REACHED_BOTTOM;
        }

        // STATES.SCROLLING_UP
        if (state === STATES.SCROLLING_UP) {
            if (is_scrolling_up && container_boundry.top >= 150) {
                return STATES.REACHED_TOP;
            }

            return STATES.SCROLLING_UP;
        }
        // STATE.REACHED_TOP
        if (state === STATES.REACHED_TOP) {
            if (is_scrolling_down)
                return STATES.SCROLLING_DOWN;

            if (this.hasReachedTop())
                return STATES.REACHED_TOP;

            return STATES.REACHED_TOP;
        }

        if (state === STATES.SCROLLING_DOWN) {
            if (this.hasReachedBottom())
                return STATES.REACHED_BOTTOM;

            return STATES.SCROLLING_DOWN;
        }

        // When reached bottom
        if (this.hasReachedBottom()) {
            return STATES.REACHED_BOTTOM;
        }

        return STATES.DEFAULT;
    }

    getTopPosition(state) {
        switch (state) {
            case STATES.SCROLLING_UP:
            case STATES.SCROLLING_DOWN:
                if ([STATES.SCROLLING_UP, STATES.SCROLLING_DOWN].indexOf(this.state.state) === -1) { //Set it only once
                    const container_top = this.getPositionOfContainer().top;
                    return window.scrollY + container_top - this.ORIGINAL_CONTAINER_TOP_POSITION;
                }
                return this.state.top;
            case STATES.REACHED_TOP:
                return this.FIXED_HEADER_HEIGHT;

            case STATES.REACHED_BOTTOM:
            case STATES.DEFAULT:
            default:
                return 'auto';

        }
    }

    getBottomPosition(state) {
        switch (state) {
            case STATES.REACHED_BOTTOM:
                const distance = getDistanceBetweenPageBoundryAndWindow();

                return distance < 0 ? 0 : distance;

            case STATES.SCROLLING_UP:
            case STATES.SCROLLING_DOWN:
            case STATES.REACHED_TOP:
            case STATES.DEFAULT:
            default:
                return 'auto';

        }
    }

    getPosition(state) {
        const state_position_map = {
            [STATES.DEFAULT] : 'relative',
            [STATES.REACHED_TOP]: 'fixed',
            [STATES.REACHED_BOTTOM]: 'fixed',
            [STATES.SCROLLING_UP]: 'absolute',
            [STATES.SCROLLING_DOWN]: 'absolute'
        };

        return state_position_map[state];
    }

    getStyle() {
        if (this.props.disabled) return null;
        const width = getPositionOfElement(this.props.parent_component_classname).width;
        const {position, bottom, top} = this.state;
        return {position, bottom, top, width};
    }

    setScrollingDirection() {
        this.scrolling_prev_y = this.scrolling_y;
        this.scrolling_y = window.scrollY;
    }

    getScrollingDirection() {
        const delta = this.scrolling_prev_y - this.scrolling_y;
        if (!delta) return null;

        if (delta > 0 && delta > 1) return 'up';
        if (delta < 0 && delta < -1) return 'down';

        return null;
    }

    requestAnimationFrame () {
        this.animation_frame = window.requestAnimationFrame(this.recomputeState);
    }

    hasReachedTop() {
        const container_top_position = this.getPositionOfContainer().top;

        return container_top_position <= this.FIXED_HEADER_HEIGHT;
    }

    hasReachedBottom() {
        const page_height = (document.documentElement.clientHeight - 30);
        const container_bottom_position = this.container.getBoundingClientRect().bottom;

        if (this.state.state === STATES.REACHED_BOTTOM) {
            return true;
        }

        const reached_bottom = container_bottom_position < page_height;
        if (reached_bottom) {
            return true;
        }

        return false;
    }

    recomputeState() {
        const state = this.getScrollState();

        const position = this.getPosition(state);
        const top = this.getTopPosition(state);
        const bottom = this.getBottomPosition(state);

        // debug("style:", state,  position,
        //     bottom,
        //     top);

        this.setState({
            state,
            position,
            bottom,
            top
        });

        this.setScrollingDirection();
        this.requestAnimationFrame();
    }

    render() {
        return (<div className="rb-scrollable-sticky"
                 ref={(node)=>this.container = node}
                style={this.getStyle()}>
            {this.props.children}
        </div>);
    }
}

ScrollableSticky.propTypes = {
    children: PropTypes.node,
    disabled: PropTypes.bool,
    parent_component_classname: PropTypes.string
};

export default ScrollableSticky;