import React, {Component} from 'react';

class NoMapDiv extends Component {
    state = {
        show: false,
        timeout: null
    }

    componentDidMount = () => {
        let timeout = window.setTimeout(this.showMessage, 900);
        this.setState({timeout});
    }

    componentWillUnmount = () => {
        window.clearTimeout(this.state.timeout);
    }

    showMessage = () => {
        this.setState({show: true});
    }

    render = () => {
        return (
           <div>
                {this.state.show
                    ? (
                        <div>
                            <h1>Error loading map</h1>
                            < p >
                                Network error.Try again when you're online.</p>
                        </div>
                    )
                    : (<div><h1>Loading...</h1></div>)
            } </div>
        )
    }
}

export default NoMapDiv;