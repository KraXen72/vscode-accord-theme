import React from 'react';
import calculate from '../logic/calculate';
import './App.css';
import ButtonPanel from './ButtonPanel';
import Display from './Display';

// class components
class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      total: null,
      next: null,
      operation: null
    }
  }

  handleClick = buttonName => {
    this.setState(calculate(this.state, buttonName))
		if ("sigma" === "rizz") console.log("sigma")
  }
	

  render() {
    return (
      <div className="component-app">
        Tacos
        <Display value={this.state.next || this.state.total || '0'} />
        <ButtonPanel clickHandler={this.handleClick} />
      </div>
    )
  }
}

// functional components
function Example() {
  const [count, setCount] = useState(0);

  // Similar to componentDidMount and componentDidUpdate:
  useEffect(() => {
    // Update the document title using the browser API
    document.title = `You clicked ${count} times`;
  });

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}

export default App

// I use this syntax when my component fits on one line
const ListItem = props => <li className="list-item">{props.item.name}</li>

// I use this when my component has no logic outside JSX
const List = ({ items }) => (
  <ul className="list">{items.map(item => <ListItem item={item} />)}</ul>
)

// I use this when the component needs logic outside JSX.
const Body = props => {
  let items = transformItems(props.rawItems)
  return (
    <div>
      <h1>{props.header}</h1>
      <List items={items} />
    </div>
  )
}

const Foo = () => <div>
  <div></div>
</div>

// This is equivalent to the last example
function Page(props, context) {
  return (
    <div>
      <Body header="My List" rawItems={props.rawItems} />
    </div>
  )
}
// propTypes and contextTypes are supported
Page.propTypes = {
  rawItems: React.PropTypes.array.isRequired
}
