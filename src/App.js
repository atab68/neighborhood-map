import React, {Component} from 'react';
import './App.css';
import locations from './API/locations.json';
import MapDiv from './components/MapDiv';
import ListItems from './components/ListItems';

class App extends Component {
  state = {
    lat: 41.8781,
    lon: -87.6298,
    zoom: 15,
    all: locations,
    filtered: null,
    open: false
  }

  styles = {
    menuButton: {
      marginLeft: 10,
      marginRight: 20,
      position: "absolute",
      left: 10,
      top: 23,
      background: "#f5f5f5",
      padding: 10
    },
    hide: {
      display: 'none'
    },
    header: {
      marginTop: "0px"
    }
  };

  componentDidMount = () => {
    this.setState({
      ...this.state,
      filtered: this.filterLocations(this.state.all, "")
    });
  }

  toggleDrawer = () => {
    // toggleDrawer function
    this.setState({
      open: !this.state.open
    });
  }

  updateQuery = (query) => {
    // Update the query value
    this.setState({
      ...this.state,
      selectedIndex: null,
      filtered: this.filterLocations(this.state.all, query)
    });
  }

  filterLocations = (locations, query) => {
    // Filter locations
    return locations.filter(location => location.name.toLowerCase().includes(query.toLowerCase()));
  }

  clickListItem = (index) => {
    this.setState({ selectedIndex: index, open: !this.state.open })
  }

  render = () => {
    return (
      <div  role="main" className="App">
        <div>
          <button onClick={this.toggleDrawer} style={this.styles.menuButton}>
            <i className="fa fa-bars"></i>
          </button>
          <h1>Near Me Restaurants in Chicago</h1>
        </div>
        <MapDiv
          lat={this.state.lat}
          lon={this.state.lon}
          zoom={this.state.zoom}
          locations={this.state.filtered}
          selectedIndex={this.state.selectedIndex}
          clickListItem={this.clickListItem}/>
        <ListItems
          locations={this.state.filtered}
          open={this.state.open}
          toggleDrawer={this.toggleDrawer}
          filterLocations={this.updateQuery}
          clickListItem={this.clickListItem}/>

      </div>
    );
  }
}

export default App;
