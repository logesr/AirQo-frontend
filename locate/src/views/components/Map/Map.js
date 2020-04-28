import React from "react";
import { connect } from "react-redux";
import { mapRenderDefaults } from "../../../redux/Maps/actions";
import PropTypes from "prop-types";

import {
  Map,
  FeatureGroup,
  LayerGroup,
  TileLayer,
  Marker,
  Popup
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import axios from "axios";
import L from "leaflet";
import { ElementClass } from "enzyme";
import FullscreenControl from "react-leaflet-fullscreen";
import "react-leaflet-fullscreen/dist/styles.css";
import MapMenu from "./MapMenu";
// From locate MAP
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { CardActions, Divider } from "@material-ui/core";
//--End--

// From Locate Save
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Collapse from "@material-ui/core/Collapse";
import InboxIcon from "@material-ui/icons/MoveToInbox";
import SaveIcon from "@material-ui/icons/Save";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import StarBorder from "@material-ui/icons/StarBorder";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
// -- End --

let geoJsonPolygon;

class Maps extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      polygons: [],
      markers: [[0.32, 32.598]],
      // gets the shapefile format to save (polygon drawn within the planning space)
      plan: {},
      // from LOCATE FORM
      numberOfDevices: "",
      mustHaveCoord: "",
      btnSubmit: false,
      //newly added - passed to the model endpoint
      geoJSONDATA: "",
      // added from locateSave
      open: false,
      openSave: false,
      openConfirm: false,
      savedPlan: {},
      space_name: ""
    };
    //from locate
    this.changeHandler = this.changeHandler.bind(this);
    this.submitHandler = this.submitHandler.bind(this);
    //from locateSave
    this.handleClick = this.handleClick.bind(this);
    this.handleSaveClick = this.handleSaveClick.bind(this);
    this.handleSaveClose = this.handleSaveClose.bind(this);
    this.changeHandler = this.changeHandler.bind(this);
    this.handleConfirmClose = this.handleConfirmClose.bind(this);
  }
  // Retrieve previously saved planning space by this current user
  // added from save planning space
  componentDidMount() {
    axios
      .get(
        `http://localhost:4000/api/v1/map/getlocatemap/` +
          this.props.auth.user._id
      )
      .then(res => {
        this.setState({ savedPlan: res.data[0] });
        //console.log(this.state, "current user: ", this.props.auth.user._id);
      })
      .catch(e => {
        console.log(e);
      });
  }

  // save planning space
  savePlanningSpace = () => {
    // head the save planning space dialog
    this.setState(prevState => ({ openSave: !prevState.openSave }));
    // make api call
    console.log("plan: ", this.state.plan);
    axios
      .post(
        `http://localhost:4000/api/v1/map/savelocatemap`,
        {
          user_id: this.props.auth.user._id,
          space_name: this.state.space_name,
          plan: this.state.plan
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      )
      .then(res => {
        console.log(res);
        this.setState(prevState => ({ openConfirm: !prevState.openConfirm })); //
      })
      .catch(e => console.log(e));
  };
  // This deals with save planing space dialog box
  handleSaveClick = () => {
    this.setState(prevState => ({ openSave: !prevState.openSave }));
  };
  handleSaveClose = () => {
    this.setState(prevState => ({ openSave: !prevState.openSave }));
    //console.log(this.state, this.props.plan, this.props.user_id);
  };
  // hooks the planning space textfield input
  changeHandler = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  // Handles saved space confirmation feedback
  handleConfirmClose = () => {
    this.setState(prevState => ({ openConfirm: !prevState.openConfirm }));
  };

  // load previously saved space
  handleClick = () => {
    this.setState(prevState => ({ open: !prevState.open }));
  };
  //--End-----------------------------------------------------------

  // From LocateForm
  changeHandler = e => {
    this.setState({ [e.target.name]: e.target.value });
    // toggle submit button ON and OFF
    if (e.target.name == "numberOfDevices") {
      if (e.target.value != "") {
        this.setState({ btnSubmit: true });
      } else {
        this.setState({ btnSubmit: false });
      }
    }
  };

  submitHandler = e => {
    e.preventDefault();
    //functionality after submitting form.
    // make api call
    // axios
    //   .post(
    //     `http://localhost:4000/api/v1/map/parishes`,
    //     {
    //       sensor_number: parseInt(this.state.numberOfDevices, 10),
    //       polygon: this.props.plan.geometry["coordinates"]
    //     },
    //     {
    //       headers: {
    //         "Content-Type": "application/json"
    //       }
    //     }
    //   )
    //   .then(res => {
    //     console.log(res);
    //     console.log(
    //       "Must have: ",
    //       this.state.mustHaveCoord == "" ? "None" : this.state.mustHaveCoord
    //     );
    //     //this.setState(prevState => ({ openConfirm: !prevState.openConfirm })); //
    //     console.log(this.state, this.props.plan);
    //   })
    //   .catch(e => console.log(e));

    axios
      .post(
        "http://127.0.0.1:4000/api/v1/map/parishes",
        this.state.geoJSONDATA,
        {
          headers: { "Content-Type": "application/json" }
        }
      )
      .then(res => {
        const myData = res.data;
        console.log(myData);

        let myPolygons = [];

        try {
          myData.forEach(element => {
            if (element["properties.district"]) {
              myPolygons.push({
                type: "Feature",
                properties: {
                  district: element["properties.district"],
                  subcounty: element["properties.subcounty"],
                  parish: element["properties.parish"],
                  lat: element["properties.lat"],
                  long: element["properties.long"],
                  color: element["color"],
                  fill_color: element["fill_color"],
                  type: element.type
                },
                geometry: {
                  type: "Polygon",
                  coordinates: element["geometry.coordinates"]
                }
              });
            } else {
              myPolygons.push({
                type: "Feature",
                properties: {
                  district: element.properties.district,
                  subcounty: element.properties.subcounty,
                  parish: element.properties.parish,
                  lat: element.properties.lat,
                  long: element.properties.long,
                  color: element.color,
                  fill_color: element.fill_color,
                  type: element.type
                },
                geometry: {
                  type: "Polygon",
                  coordinates: element.geometry.coordinates
                }
              });
            }
          });

          this.setState({
            polygons: myPolygons
          });
        } catch (error) {
          console.log("An error occured. Please try again");
        }
      });
  };
  //--End----------------------------------------------------------

  _onEditStop = e => {
    console.log("_onEditStop", e);
  };

  _onCreated = e => {
    let type = e.layerType;
    let layer = e.layer;
    if (type === "marker") {
      // Do marker specific actions
      console.log("_onCreated: marker created", e);
    }
    if (type === "polygon") {
      // here you got the polygon points
      ///const points = layer._latlngs;

      //var geojson = layer.toGeoJSON();
      //geoJsonPolygon = layer.toGeoJSON();
      //const polygon = geoJsonPolygon.geometry["coordinates"];
      console.log(JSON.stringify(layer.toGeoJSON()));
      this.setState({ plan: layer.toGeoJSON() });

      //newly added
      this.setState({ geoJSONDATA: JSON.stringify(layer.toGeoJSON()) });

      //this code has been moved to submitHandler
    }
  };

  render() {
    //from locate form
    const { numberOfDevices, mustHaveCoord } = this.state;

    const styles = {
      backgroundColor: "#FFF",
      zIndex: 999,
      position: "absolute",
      height: "auto",
      width: 250,
      opacity: 0.9
      //marginTop: "7em"
    };
    //--end--
    // Save planning styles
    const nested = {
      paddingLeft: "2em"
    };
    const savePlan = {
      backgroundColor: "#FFF",
      zIndex: 999,
      position: "absolute",
      height: "auto",
      width: 250,
      opacity: 0.6,
      top: "20em"
    };

    return (
      <>
        {/* Adding MapMenu */}
        {/* <MapMenu geojson={this.state.plan} /> */}
        {/* Adding Locate Form */}
        <div style={styles}>
          <form noValidate autoComplete="off" onSubmit={this.submitHandler}>
            <Divider />
            <TextField
              name="numberOfDevices"
              label="Number of Devices"
              placeholder="No. of devices"
              required
              value={numberOfDevices}
              onChange={this.changeHandler}
              fullWidth
              margin="normal"
            />
            <TextField
              name="mustHaveCoord"
              label="'Must Have' Locations"
              placeholder="[[Lng, Lat],...,[Lng, Lat]]"
              onChange={this.changeHandler}
              value={mustHaveCoord}
              fullWidth
              margin="normal"
            />
            <CardActions>
              <Button
                type="submit"
                name="submit"
                disabled={this.state.btnSubmit == false ? "true" : ""}
                color="secondary"
                variant="contained"
                size="small"
              >
                Submit
              </Button>
            </CardActions>
          </form>
        </div>
        {/* End of Locate Form Menu */}

        {/* Locate Save Menu */}
        <div>
          <List
            component="nav"
            aria-labelledby="nested-list-subheader"
            style={savePlan}
          >
            <ListItem button>
              <ListItemIcon>
                <SaveIcon />
              </ListItemIcon>
              <ListItemText primary="Save" onClick={this.handleSaveClick} />
            </ListItem>
            <ListItem button onClick={this.handleClick}>
              <ListItemIcon>
                <InboxIcon />
              </ListItemIcon>
              <ListItemText primary="Open" />
              {this.state.open ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={this.state.open} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem button style={nested}>
                  <ListItemIcon>
                    <StarBorder />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      this.state.savedPlan == null
                        ? ""
                        : this.state.savedPlan.space_name
                    }
                  />
                </ListItem>
              </List>
            </Collapse>
          </List>

          {/* Dialog for save locate data */}
          <Dialog
            open={this.state.openSave}
            onClose={this.handleSaveClose}
            aria-labelledby="form-dialog-title"
          >
            {/* <DialogTitle id="form-dialog-title">Save Planning Space</DialogTitle> */}
            <DialogContent>
              <DialogContentText>
                To save this planning space, please enter the name in the text
                field below. Thank you for using AirQo Locate service.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                name="space_name"
                value={this.state.space_name}
                onChange={this.changeHandler}
                label="Save As"
                type="text"
                placeholder="airqo_locate_plan_001"
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleSaveClose} color="primary">
                Cancel
              </Button>
              <Button onClick={this.savePlanningSpace} color="primary">
                Save
              </Button>
            </DialogActions>
          </Dialog>

          {/* Dialog for confirming saved location data  */}
          <Dialog
            open={this.state.openConfirm}
            onClose={this.handleConfirmClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            {/* <DialogTitle id="alert-dialog-title">
          {"Use Google's location service?"}
        </DialogTitle> */}
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Locate Planning Space has been saved successfully
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleConfirmClose} color="primary">
                OK
              </Button>
            </DialogActions>
          </Dialog>
        </div>
        {/* End of Locate Save Menu */}

        <Map
          center={[this.props.mapDefaults.lat, this.props.mapDefaults.lng]}
          zoom={this.props.mapDefaults.zoom}
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
          />

          <FullscreenControl position="topright" />

          <LayerGroup>
            }
            {this.state.polygons.map(location => (
              <Marker
                key={location.parish}
                position={{
                  lat: location.properties.lat,
                  lng: location.properties.long
                }}
                icon={
                  new L.Icon({
                    iconUrl:
                      "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-" +
                      location.properties.color +
                      ".png",
                    shadowUrl:
                      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                  })
                }
                onMouseOver={e => {
                  e.target.openPopup();
                }}
                onMouseOut={e => {
                  e.target.closePopup();
                }}
              >
                <Popup>
                  <span>
                    <span>
                      <b>DISTRICT: </b>
                      {location.properties.district}, <br />
                      <b>SUBCOUNTY: </b>
                      {location.properties.subcounty}, <br />
                      <b>PARISH: </b>
                      {location.properties.parish}, <br />
                      <b>TYPE: </b>
                      {location.properties.type}
                    </span>
                  </span>
                </Popup>
              </Marker>
            ))}
          </LayerGroup>

          <FeatureGroup
            ref={reactFGref => {
              this._onFeatureGroupReady(reactFGref);
            }}
          >
            <EditControl
              position="topright"
              onEdited={this._onEdited}
              onCreated={this._onCreated}
              onDeleted={this._onDeleted}
              onMounted={this._onMounted}
              onEditStart={this._onEditStart}
              onEditStop={this._onEditStop}
              onDeleteStart={this._onDeleteStart}
              onDeleteStop={this._onDeleteStop}
              draw={{
                rectangle: false,
                circle: false,
                circlemarker: false
              }}
            />
          </FeatureGroup>
        </Map>
      </>
    );
  }

  _onFeatureGroupReady = ref => {
    if (ref === null) {
      return;
    }
    this._editableFG = ref;
    if (this.state.polygons) {
      for (var i = 0; i < this.state.polygons.length; i++) {
        //let leafletGeoJSON = new L.GeoJSON(this.state.polygons[i]);console.log(leafletGeoJSON);

        try {
          let leafletGeoJSON = new L.GeoJSON(this.state.polygons[i], {
            onEachFeature: function(feature, layer) {
              let popup_string =
                "<b>DISTRICT: </b>" +
                feature["properties"]["district"] +
                "<br/><b>SUBCOUNTY: </b>" +
                feature["properties"]["subcounty"] +
                "<br/><b>PARISH: </b>" +
                feature["properties"]["parish"] +
                "<br/><b>TYPE: </b>" +
                feature["properties"]["type"];
              layer.bindPopup(popup_string);
              layer.on("mouseover", function(e) {
                this.openPopup();
              });
              layer.on("mouseout", function(e) {
                this.closePopup();
              });
            },
            style: {
              fillColor: this.state.polygons[i]["properties"]["fill_color"],
              color: this.state.polygons[i]["properties"]["color"],
              opacity: 100
            }
          });
          let leafletFG = this._editableFG.leafletElement;
          leafletGeoJSON.eachLayer(layer => leafletFG.addLayer(layer));
        } catch (error) {
          console.log(
            "An error occured and some polygons may not have been shown!"
          );
        }
      }
      //console.log(toString(count)+' invalid polygons in results')
    } else {
      console.log("No polygons");
    }
  };
}

Maps.propTypes = {
  mapRenderDefaults: PropTypes.func.isRequired,
  mapDefaults: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  mapDefaults: state.mapDefaults.initMap,
  auth: state.auth
});

export default connect(mapStateToProps, { mapRenderDefaults })(Maps);
