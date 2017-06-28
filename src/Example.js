import React from 'react';
import PropTypes from 'prop-types'
import keymirror from 'keymirror';
import ScrollableSticky from './ScrollableSticky';
import './example.css';

const RightContent = () => {
    const lipsum = (<p>Curabitur pretium eros ut euismod aliquam. Donec quis mauris vel leo 
      fringilla vulputate sit amet id odio. Maecenas scelerisque lacus a iaculis tempus. Aenean 
      quis eros a ligula ullamcorper sodales. Nulla euismod, ex vel pharetra dapibus, nunc mauris 
      egestas justo, non tempor risus urna vitae libero. Donec finibus tortor ipsum, eu iaculis 
      dolor congue at. Nam est quam, pulvinar vitae turpis ut, fermentum mattis mi. In at lectus a 
      lorem congue lacinia ac non enim. Suspendisse aliquam odio vitae eros ullamcorper egestas. 
      Duis faucibus nec tortor id semper. Sed tempus ante et nisl vestibulum mollis. Maecenas feugiat tempus condimentum. 
      Donec quis metus accumsan, semper nisi vitae, pellentesque felis. Vivamus at mi sapien. Fusce vel quam sit amet eros 
      feugiat malesuada et sed arcu.</p>);

    return (<div className="content content--large">
      {lipsum}
    </div>);
}

const Sidebar = () => {
    return (<div>
      <Block style={BlockStyle.style1}/>
      <Block style={BlockStyle.style1}/>
      <Block style={BlockStyle.style1}/>
      <Block style={BlockStyle.style1}/>
      <Block style={BlockStyle.style1}/>
    </div>);
}

const BlockStyle = keymirror({
  style1: null,
});

const Block = ({style}) => (<div className={`block block--${style}`}/>);
Block.propTypes = {
  style: PropTypes.oneOf(Object.keys(BlockStyle))
};

const Row = ({children}) => (<div className="row">{children}</div>);
Row.propTypes = {
  children: PropTypes.node
};

const ColLeft = ({children}) => (<div className='col col--left js-col-left'>{children}</div>);
ColLeft.propTypes = {
  children: PropTypes.node
};

const ColRight = ({children}) => (<div className='col col--right'>{children}</div>);
ColRight.propTypes = {
  children: PropTypes.node
};

const App = () => {
  return (
    <div className="container js-page">
      <Row>
        <ColLeft>
          <ScrollableSticky 
              parent_component_classname='js-col-left'>
            <Sidebar/>
          </ScrollableSticky>
        </ColLeft>
        <ColRight>
          <RightContent/>
        </ColRight>
      </Row>
    </div>
  );
}

export default App;
