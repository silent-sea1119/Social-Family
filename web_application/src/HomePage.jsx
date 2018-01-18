//Source A
import "./HomePage.css";
import "./BackgroudImage.css";
import logo from "./logo.svg";

//React config
import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";

//Material UI components
import { withStyles } from "material-ui/styles";
import Drawer from "material-ui/Drawer";
import AppBar from "material-ui/AppBar";
import Toolbar from "material-ui/Toolbar";
import Typography from "material-ui/Typography";
import Divider from "material-ui/Divider";
import Button from "material-ui/Button";

//Original component
import ChannelManager from "./ChannelManager";
import Chatwindow from "./ChatWindow";
import Clock from "./Clock";
import PersonInfoAvatars from "./PersonInfoAvatars";
import LockButton from "./LockButton";
import PinWindow from "./PinWindow";

//Twilio IP-Messages library
import Chat from "twilio-chat";

//AJAX library
const axios = require("axios");

const drawerWidth = 280;

const styles = theme => ({
  root: {
    width: "100%",
    height: 900,
    overflow: "hidden"
  },
  appFrame: {
    position: "relative",
    display: "flex",
    width: "100%",
    height: "100%",
    color: "primary"
  },
  appBar: {
    position: "absolute",
    width: `calc(100% - ${drawerWidth}px)`,
    backgroundColor: "#eeeeee"
  },
  button: {
    position: "relative",
    margin: theme.spacing.unit,
    left: `calc(100% - ${drawerWidth}px)`
  },
  drawerPaper: {
    position: "relative",
    height: "100%",
    width: drawerWidth,
    backgroundColor: "#eeeeee"
  },
  drawerHeader: theme.mixins.toolbar,
  content: {
    backgroundColor: theme.palette.background.default,
    width: "100%",
    padding: theme.spacing.unit * 3,
    height: "calc(100%)",
    marginTop: 56,
    [theme.breakpoints.up("sm")]: {
      height: "calc(100% )",
      marginTop: 64
    }
  },
  row: {
    display: "flex",
    justifyContent: "center"
  }
});

class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isLogin: false,
      isChatSetUp: false,
      isFirstLogin: true,
      isLocked: false,
      currentUserName: "",
      currentUserEmail: "",
      currentUserPicture: "",
      currentChatClient: "",
      currentChannel: "",
      twilioIdentity: "",
      twilioToken: "",
      contactList: []
    };
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.changeChannel = this.changeChannel.bind(this);
    this.changeIsFirstLogin = this.changeIsFirstLogin.bind(this);
    this.changeIsLocked = this.changeIsLocked.bind(this);
  }

  componentDidMount() {
    //Get userinfo from our python backend
    axios
      .get("/userinfo")
      .then(response => {
        if (!response.data.user_status) {
        } else {
          let currentUserName = response.data.user_name;
          let currentUserEmail = response.data.user_email;
          let currentUserPicture = response.data.user_picture;
          let currentUserStatus = response.data.user_status;
          let isFirstLogin = response.data.user_isFirsttime;
          this.setState({ isLogin: currentUserStatus });
          this.setState({ isFirstLogin: isFirstLogin });
          this.setState({ currentUserName });
          this.setState({ currentUserEmail });
          this.setState({ currentUserPicture });
        }
      })
      .catch(function(error) {
        console.log(error);
      });

    //Get twilio Token from our python backend
    axios
      .get("/token")
      .then(response => {
        if (!response.data.token) {
        } else {
          let twilioIdentity = response.data.identity;
          let twilioToken = response.data.token;
          let chatClient = new Chat(twilioToken);
          this.setState({ twilioIdentity });
          this.setState({ twilioToken });
          this.setState({ currentChatClient: chatClient });
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  login() {
    //Redirect to google
    window.location.href = "http://127.0.0.1:5000/login";
  }

  logout() {
    //Tell backend to clear all the session.
    window.location.href = "http://127.0.0.1:5000/logout";
    this.setState({ isChatSetUp: false });
  }

  //This function will be passed to ChannelManager
  changeChannel(channel) {
    this.setState({ currentChannel: channel });
    this.setState({ currentChannelName: channel.friendlyName });
    this.setState({ isChatSetUp: true });
  }

  //Show chat page after first time log in
  changeIsFirstLogin() {
    this.setState({ isFirstLogin: false });
  }

  //Lock or unlock the session
  changeIsLocked(lockedStatus) {
    // let isLocked = lockedStatus;
    this.setState({ isLocked: lockedStatus });
  }

  render() {
    const { classes } = this.props;
    let isLogin = this.state.isLogin;
    let isFirstLogin = this.state.isFirstLogin;
    let isChatSetUp = this.state.isChatSetUp;
    let isLocked = this.state.isLocked;
    let currentChannelName =
      "Chating service is running ! Your are currently in " +
      this.state.currentChannelName;
    if (!this.state.currentChannelName) {
      currentChannelName = "Chating service is running !";
    }

    const drawer = (
      <Drawer
        type="permanent"
        classes={{
          paper: classes.drawerPaper
        }}
      >
        <div
          id="personInfo"
          className={classes.drawerHeader}
          children={
            <div className={classes.row} id="personInfo">
              {isLogin ? (
                <div>
                  <PersonInfoAvatars
                    name={this.state.currentUserName}
                    email={this.state.currentUserEmail}
                    picture={this.state.currentUserPicture}
                  />
                  <LockButton changeStatus={this.changeIsLocked} />
                </div>
              ) : (
                <img src={logo} className="App-logo" alt="logo" />
              )}
            </div>
          }
        />
        <Divider />
        <div id="Contacts container">
          {isLogin ? (
            //Contact List
            <div id="contacts list title">
              <Typography
                type="title"
                color="default"
                children="Channels List"
                noWrap
              />
              <Divider />
              <ChannelManager
                isLocked={isLocked}
                changeChannel={this.changeChannel}
              />
              <Divider />
            </div>
          ) : (
            <div id="loading list" />
          )}
        </div>
      </Drawer>
    );

    return (
      <div id="home page container" className={classNames("background")}>
        <div id="root" className={classes.root}>
          <div id="appFrame" className={classes.appFrame}>
            <AppBar className={classNames(classes.appBar)}>
              {isLogin ? (
                <Toolbar>
                  <Typography type="title" color="default" noWrap>
                    Welcome Back!
                  </Typography>
                  <Button
                    className={classNames(classes.button)}
                    color="default"
                    onClick={this.logout}
                  >
                    Logout
                  </Button>
                </Toolbar>
              ) : (
                <Toolbar>
                  <Typography type="title" color="default" noWrap>
                    Designed for kids
                  </Typography>
                  <Button
                    className={classNames(classes.button)}
                    color="default"
                    onClick={this.login}
                  >
                    Login
                  </Button>
                </Toolbar>
              )}
            </AppBar>
            {isFirstLogin & isLogin ? (
              <div className={classNames("background")}>
                <PinWindow changeLoginStatus={this.changeIsFirstLogin} />
              </div>
            ) : (
              <div>{drawer}</div>
            )}
            <main className={classNames(classes.content, "background")}>
              <div id="chat window">
                {isLogin ? (
                  <div id="display window">
                    {isChatSetUp ? (
                      <div id="twilio service running ">
                        <Typography type="title" color="default" noWrap>
                          {currentChannelName}
                        </Typography>
                        <Chatwindow
                          currentChannel={this.state.currentChannel}
                          currentUser={this.state.currentUserEmail}
                        />
                      </div>
                    ) : (
                      <Typography type="title" color="default" noWrap>
                        Chat service disconnected -.-
                      </Typography>
                    )}
                  </div>
                ) : (
                  <div id="no login no window" />
                )}
              </div>
            </main>
          </div>
        </div>
        <footer>
          <Clock />
        </footer>
      </div>
    );
  }
}

HomePage.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(HomePage);
