//Source A
//React config
import React from "react";

//Material UI components
import Chip from "material-ui/Chip";
import { withStyles } from "material-ui/styles";
import Avatar from "material-ui/Avatar";
import FaceIcon from "material-ui-icons/Face";
import red from "material-ui/colors/red";
import Chat from "twilio-chat";
import Typography from "material-ui/Typography";
import Button from "material-ui/Button";
import Icon from "material-ui/Icon";
import Input, { InputLabel } from "material-ui/Input";
import Divider from "material-ui/Divider";
import List from "material-ui/List/List";
import { CircularProgress } from "material-ui/Progress";
import purple from "material-ui/colors/purple";
import Snackbar from "material-ui/Snackbar";
import IconButton from "material-ui/IconButton";
import CloseIcon from "material-ui-icons/Close";

//AJAX library
const axios = require("axios");

const styles = theme => ({
  chip: {
    margin: theme.spacing.unit
  },
  svgIcon: {
    color: red[200]
  },
  row: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap"
  },
  button: {
    margin: theme.spacing.unit - 5,
    width: "40%"
  },
  container: {
    display: "flex",
    flexWrap: "wrap",
    width: 240
  },
  input: {
    marginLeft: theme.spacing.unit - 20,
    marginRight: theme.spacing.unit - 20,
    width: 100
  },
  progress: {
    margin: `0 ${theme.spacing.unit * 2}px`
  },
  close: {
    width: theme.spacing.unit * 10,
    height: theme.spacing.unit * 10
  }
});
class ChannelManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      contactList: [],
      invitationList: [],
      currentChannel: "",
      isContactListReady: false,
      isInvitationListReady: false,
      isChannelReady: false,
      invitationSnackBarOpen: false,
      snackInvitationmessage: "",
      invitateSnackBarOpen: false,
      snakeInvitatemessage: "",
      error: null,
      chatClient: "",
      newChannlename: "",
      emailAdress: ""
    };
    this.loadContactList = this.loadContactList.bind(this);
    this.hadnleNewChannleChange = this.hadnleNewChannleChange.bind(this);
    this.handleNewChannleSubmit = this.handleNewChannleSubmit.bind(this);
    this.handleInvitaionChange = this.handleInvitaionChange.bind(this);
    this.handleInvitationSubmit = this.handleInvitationSubmit.bind(this);
  }

  //TODO:Add listener for update channel list
  componentDidMount() {
    this.loadContactList();
    const updateContactList = this.loadContactList.bind(this);
    const setState = this.setState.bind(this);
    axios
      .get("/token")
      .then(response => {
        if (!response.data.token) {
        } else {
          let twilioToken = response.data.token;
          let chatClient = new Chat(twilioToken);
          chatClient.on("channelAdded", function(channel) {
            setState({ isContactListReady: false });
            updateContactList();
          });
          chatClient.on("channelRemoved", function(channel) {
            setState({ isContactListReady: false });
            updateContactList();
          });
          chatClient.on("channelInvited", function(channel) {
            let message = "Invited to channel " + channel.friendlyName;
            setState({ snackInvitationmessage: message });
            setState({ invitationSnackBarOpen: true });
          });
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  }

  //TODO: Remove listener
  componentWillUnmount() {
    let chatClient = this.state.chatClient;
    chatClient.removeAllListeners();
  }

  //TODO: Load contact list from twilio list
  loadContactList() {
    const setState = this.setState.bind(this);
    axios
      .get("/token")
      .then(response => {
        if (!response.data.token) {
          console.log(response);
        } else {
          let twilioToken = response.data.token;
          let chatClient = new Chat(twilioToken);
          chatClient.getSubscribedChannels().then(function(paginator) {
            let contactList = paginator.items.map(data => {
              return data;
            });
            setState({ contactList: contactList });
            setState({ chatClient: chatClient });
            setState({ isContactListReady: true });
          });
        }
      })
      .catch(function(error) {
        setState({ error: error });
      });
  }

  //Delete channels
  handleChannelDelete = data => () => {
    const contactList = [...this.state.contactList];
    const contactToDelete = contactList.indexOf(data);
    contactList[contactToDelete].delete().then(function(channel) {});
  };

  //Swich between channels
  handleChannelSwitch = data => () => {
    const changeChannel = this.props.changeChannel;
    const contactList = [...this.state.contactList];
    const channelToJoin = contactList.indexOf(data);
    changeChannel(contactList[channelToJoin]);
    contactList[channelToJoin].join().catch(function(err) {
      console.log(err);
    });

    this.setState({ currentChannel: contactList[channelToJoin] });
    this.setState({ isChannelReady: true });
  };

  //Form action for creating a new Channel
  hadnleNewChannleChange(e) {
    this.setState({ newChannlename: e.target.value });
  }

  handleNewChannleSubmit(e) {
    const chatClient = this.state.chatClient;
    const props = this.props;
    const setState = this.setState.bind(this);
    try {
      chatClient
        .createChannel({
          uniqueName: "Private channel called" + this.state.newChannlename,
          friendlyName: this.state.newChannlename,
          isPrivate: true
        })
        .then(function(channel) {
          channel.join().catch(function(err) {
            console.error(
              "Couldn't join channel " +
                channel.friendlyName +
                " because " +
                err
            );
          });
          props.changeChannel(channel);
          setState({ currentChannel: channel });
          setState({ isChannelReady: true });
        });
    } catch (err) {
      console.log(err.message);
    }
    this.setState({ newChannlename: "" });
    e.preventDefault();
  }
  //Create invitaions
  handleInvitaionChange(e) {
    this.setState({ emailAdress: e.target.value });
  }

  handleInvitationSubmit(e) {
    const currentChannel = this.state.currentChannel;
    const setState = this.setState.bind(this);
    currentChannel.invite(this.state.emailAdress).then(function() {
      let message =
        "Your friend has been invited to " + currentChannel.friendlyName;
      setState({ snakeInvitatemessage: message });
      setState({ invitateSnackBarOpen: true });
    });
    this.setState({ emailAdress: "" });
    e.preventDefault();
  }

  handleInvitationSnack = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    this.setState({ invitationSnackBarOpen: false });
  };

  handleInviteSnack = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    this.setState({ invitateSnackBarOpen: false });
  };

  render() {
    const classes = this.props;
    const {
      error,
      isContactListReady,
      contactList,
      isChannelReady
    } = this.state;
    const isLocked = this.props.isLocked;
    if (error) {
      return (
        <div id="error happens">
          <Typography>Error: {error.message}</Typography>
        </div>
      );
    } else if (!isContactListReady) {
      return (
        <div id="loding">
          <CircularProgress
            className={classes.progress}
            style={{ color: purple[500] }}
            thickness={7}
          />
        </div>
      );
    } else {
      return (
        <div>
          {isLocked ? (
            <div id="contact list">
              <List>
                <div id="contacts" className={classes.row}>
                  {contactList.map(data => {
                    return (
                      <Chip
                        avatar={
                          <Avatar>
                            <FaceIcon className={classes.svgIcon} />
                          </Avatar>
                        }
                        label={data.friendlyName}
                        key={data.sid}
                        onClick={this.handleChannelSwitch(data)}
                        className={classes.chip}
                      />
                    );
                  })}
                </div>
              </List>
            </div>
          ) : (
            <div id="ChannelManager">
              <div id="form for channel creator">
                <form onSubmit={this.handleNewChannleSubmit}>
                  <Input
                    className={classes.input}
                    id="Create a channel"
                    onChange={this.hadnleNewChannleChange}
                    placeholder="Enter a name for channel "
                  />
                  <Button
                    fab
                    mini
                    dense
                    color="accent"
                    aria-label="add"
                    className={classes.button}
                    type="submit"
                  >
                    <Icon color="contrast">add_circle</Icon>
                  </Button>
                </form>
                <Divider />
              </div>
              <div id="contact list">
                <Typography
                  type="body1"
                  color="default"
                  children="Channels"
                  noWrap
                />
                <Snackbar
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left"
                  }}
                  open={this.state.invitationSnackBarOpen}
                  autoHideDuration={3000}
                  onClose={this.handleInvitationSnack}
                  message={this.state.snackInvitationmessage}
                  action={[
                    <IconButton
                      key="close"
                      aria-label="Close"
                      color="inherit"
                      className={classes.close}
                      onClick={this.handleInvitationSnack}
                    >
                      <CloseIcon />
                    </IconButton>
                  ]}
                />
                <List>
                  <div id="contacts" className={classes.row}>
                    {contactList.map(data => {
                      return (
                        <Chip
                          avatar={
                            <Avatar>
                              <FaceIcon className={classes.svgIcon} />
                            </Avatar>
                          }
                          label={data.friendlyName}
                          key={data.sid}
                          onDelete={this.handleChannelDelete(data)}
                          onClick={this.handleChannelSwitch(data)}
                          className={classes.chip}
                        />
                      );
                    })}
                  </div>
                </List>
              </div>
              <Divider />
              <div id="invitation list" />
              <div id="invitation form">
                <div>
                  {isChannelReady ? (
                    <form
                      id="invitation creator form"
                      onSubmit={this.handleInvitationSubmit}
                    >
                      <div
                        id="invitation creator container"
                        className={classes.container}
                      >
                        <Snackbar
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "left"
                          }}
                          open={this.state.invitateSnackBarOpen}
                          autoHideDuration={3000}
                          onClose={this.handleInviteSnack}
                          message={this.state.snakeInvitatemessage}
                          action={[
                            <IconButton
                              key="close"
                              aria-label="Close"
                              color="inherit"
                              className={classes.close}
                              onClick={this.handleInviteSnack}
                            >
                              <CloseIcon />
                            </IconButton>
                          ]}
                        />
                        <InputLabel htmlFor="AddFriend">
                          <Typography
                            type="body1"
                            color="default"
                            children="Add your friends here"
                            noWrap
                          />
                        </InputLabel>
                        <Input
                          className={classes.input}
                          id="AddFriend"
                          onChange={this.handleInvitaionChange}
                          placeholder="Enter your friends email"
                          value={this.state.emailAdress}
                        />
                        <Button
                          fab
                          mini
                          color="accent"
                          aria-label="add"
                          className={classes.button}
                          type="submit"
                        >
                          <Icon color="defalut">add_circle</Icon>
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div />
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
  }
}

export default withStyles(styles)(ChannelManager);
