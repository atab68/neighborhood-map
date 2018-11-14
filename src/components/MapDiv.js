import React, {Component} from 'react';
import {Map, InfoWindow, GoogleApiWrapper} from 'google-maps-react';
import NoMapDiv from './NoMapDiv';

const map_key = "AIzaSyDmQ4LFFMlYQsyIT1GA-G0SRLqTfw5-FPE";
const client_id = "5MCQM5H0HKJBWG1G5XPM3YL4O1AOCQREKTAQOPAT4XG5HHCM";
const secret_id = "AWTTQMFEIKVGKYWLWAUIWHN2JPVA1PCSXF23PUDXWXEVA12V";
const v = "20181030";

class MapDiv extends Component {
    state = {
        map: null,
        markers: [],
        markerProps: [],
        activeMarker: null,
        activeMarkerProps: null,
        showInfoWindow: false
    };


    componentWillReceiveProps = (props) => {
        this.setState({firstDrop: false});

        // Change in the number of locations, so update the markers
        if (this.state.markers.length !== props.locations.length) {
            this.closeInfoWindow();
            this.updateMarkers(props.locations);
            this.setState({activeMarker: null});

            return;
        }

        // The selected item is not the same as the active marker, so close the info window
        if (!props.selectedIndex || (this.state.activeMarker && 
            (this.state.markers[props.selectedIndex] !== this.state.activeMarker))) {
            this.closeInfoWindow();
        }

        // Make sure there's a selected index
        if (props.selectedIndex === null || typeof(props.selectedIndex) === "undefined") {
            return;
        };

        // Treat the marker as clicked
        this.onMarkerClick(this.state.markerProps[props.selectedIndex], this.state.markers[props.selectedIndex]);
    }

    mapReady = (props, map) => {
        // Save the map reference in state and prepare the location markers
        this.setState({map});
        this.updateMarkers(this.props.locations);
    }

    closeInfoWindow = () => {
        // Disable any active marker animation
        this.state.activeMarker && this
            .state
            .activeMarker
            .setAnimation(null);
        this.setState({showInfoWindow: false, activeMarker: null, activeMarkerProps: null});
    }

    getBusnInfo = (props, data) => {
        // Look for matching restaurant API in Foursquare compared to what we already know
        return data
            .response
            .venues
            .filter(item => item.name.includes(props.name) || props.name.includes(item.name));
    }

    onMarkerClick = (props, marker, e) => {
        this.closeInfoWindow();

        // Fetch the Foursquare API for the selected restaurant
        let url = `https://api.foursquare.com/v2/venues/search?client_id=${client_id}&client_secret=${secret_id}&v=${v}&radius=100&ll=${props.position.lat},${props.position.lng}&llAcc=100`;
        let headers = new Headers();
        let request = new Request(url, {
            method: 'GET',
            headers
        });

        // Create  active marker props
        let activeMarkerProps;
        fetch(request)
            .then(response => response.json())
            .then(result => {
                // Get just the business reference for the restaurant we want from the Foursquare return
                let restaurant = this.getBusnInfo(props, result);
                activeMarkerProps = {
                    ...props,
                    foursquare: restaurant[0]
                };

                // Get the list of images for the restaurant if we got Foursquare API, or just finishing setting state with the API we have
                if (activeMarkerProps.foursquare) {
                    let url = `https://api.foursquare.com/v2/venues/${restaurant[0].id}/photos?client_id=${client_id}&client_secret=${secret_id}&v=${v}`;
                    fetch(url)
                        .then(response => response.json())
                        .then(result => {
                            activeMarkerProps = {
                                ...activeMarkerProps,
                                images: result.response.photos
                            };
                            if (this.state.activeMarker) 
                                this.state.activeMarker.setAnimation(null);
                            marker.setAnimation(this.props.google.maps.Animation.BOUNCE);
                            this.setState({showInfoWindow: true, activeMarker: marker, activeMarkerProps});
                        }).catch((error) => {
                            console.log('Can not load foursquare API', error);
                    })
                } else {
                    marker.setAnimation(this.props.google.maps.Animation.BOUNCE);
                    this.setState({showInfoWindow: true, activeMarker: marker, activeMarkerProps});
                }
            })
    }

    //Create updateMarkers function
    updateMarkers = (locations) => {
        if (!locations) 
            return;
        this
            .state
            .markers
            .forEach(marker => marker.setMap(null));


        let markerProps = [];
        let markers = locations.map((location, index) => {
            let markProps = {
                key: index,
                index,
                name: location.name,
                position: location.pos,
                url: location.url
            };
            markerProps.push(markProps);

            let animation = this.state.fisrtDrop ? this.props.google.maps.Animation.DROP : null;
            let marker = new this
                .props
                .google
                .maps
                .Marker({position: location.pos, map: this.state.map, animation});
            marker.addListener('click', () => {
                this.onMarkerClick(markProps, marker, null);
            });
            return marker;
        })

        this.setState({markers, markerProps});
    }

    render = () => {
        const style = {
            width: '100%',
            height: '100vh'
        }
        const center = {
            lat: this.props.lat,
            lng: this.props.lon
        }
        let actmarkProps = this.state.activeMarkerProps;

        return (
            <Map
                role="application"
                aria-label="map"
                onReady={this.mapReady}
                google={this.props.google}
                zoom={this.props.zoom}
                style={style}
                initialCenter={center}
                onClick={this.closeInfoWindow}>
                <InfoWindow
                    marker={this.state.activeMarker}
                    visible={this.state.showInfoWindow}
                    onClose={this.closeInfoWindow}>
                    <div>
                        <h3>{actmarkProps && actmarkProps.name}</h3>
                        {actmarkProps && actmarkProps.url
                            ? (
                                <a href={actmarkProps.url}>See website</a>
                            )
                            : ""}
                        {actmarkProps && actmarkProps.images
                            ? (
                                <div><img
                                    alt={actmarkProps.name + " food picture"}
                                    src={actmarkProps.images.items[0].prefix + "100x100" + actmarkProps.images.items[0].suffix}/>
                                    <p>Image from Foursquare</p>
                                </div>
                            )
                            : ""
                        }
                    </div>
                </InfoWindow>
            </Map>
        )
    }
}

export default GoogleApiWrapper({apiKey: map_key, LoadingContainer: NoMapDiv})(MapDiv)
