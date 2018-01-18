//Source A
//React config
import React from "react";

//Material UI components
import Divider from "material-ui/Divider";
import Button from "material-ui/Button";
import Send from "material-ui-icons/Send";
import Typography from "material-ui/Typography";
import { withStyles } from "material-ui/styles";
import TextField from "material-ui/TextField";
//Npm react-custom-scrollbars component
import { Scrollbars } from "react-custom-scrollbars";

const axios = require("axios");

const styles = theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
    width: "100%",
    height: "500px"
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: "400px",
    align: "center"
  },
  root: theme.mixins.gutters({
    paddingTop: 16,
    paddingBottom: 16,
    marginTop: theme.spacing.unit * 3,
    width: 120
  })
});

class ChatWindow extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      historyMessages: [],
      newMessages: [],
      inputmessage: ""
    };
    this.submitHandler = this.submitHandler.bind(this);
    this.textChangeHandler = this.textChangeHandler.bind(this);
    this.scrollToBottom = this.scrollToBottom.bind(this);
    this.handleEnterInput = this.handleEnterInput.bind(this);
    this.deliverMessage = this.deliverMessage.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps !== this.props) {
      //Remove previous listener
      const currentChannel = this.props.currentChannel;

      currentChannel.removeAllListeners();
      //Get history of another channel and set up a new listener.
      let newMessages = [];
      const newChannel = nextProps.currentChannel;
      const setState = this.setState.bind(this);

      let scrollToBottom = this.scrollToBottom.bind(this); //Auto scrollToBottom
      newChannel.getMessages().then(function(messages) {
        setState({ newMessages: [] }); //Clear History input
        setState({ historyMessages: messages.items });
        scrollToBottom();
      });
      newChannel.on("messageAdded", function(message) {
        newMessages = newMessages.concat(message);
        setState({ newMessages: newMessages });
        scrollToBottom();
      });
    }
  }

  componentDidMount() {
    const currentChannel = this.props.currentChannel;
    let newMessages = [];
    const setState = this.setState.bind(this);
    let scrollToBottom = this.scrollToBottom.bind(this);
    currentChannel.getMessages().then(function(messages) {
      setState({ historyMessages: messages.items });
      scrollToBottom();
    });
    currentChannel.on("messageAdded", function(message) {
      newMessages = newMessages.concat(message);
      setState({ newMessages: newMessages });
      scrollToBottom();
    });
  }

  componentWillUnmount() {
    //Remove the listener in case of memory leak;
    const currentChannel = this.props.currentChannel;
    currentChannel.removeListener("messageAdded");
  }

  scrollToBottom() {
    this.scrollbar.scrollToBottom();
  }

  submitHandler(event) {
    // Stop the form from refreshing the page on submit
    const channel = this.props.currentChannel;
    var risk = "";
    // make a request
    axios
      .post("/sentiment", {
        message: this.state.inputmessage
      })
      .then(response => {
        if (response.data.status) {
          console.log(response);
        } else {
          risk = " ******* ";
        }
        this.deliverMessage(risk, channel, event);
      })
      .catch(function(error) {
        console.log(error);
      });
    event.preventDefault();
  }

  handleEnterInput(e) {
    const channel = this.props.currentChannel;
    var risk = "";
    if (e.key === "Enter") {
      // make a request
      axios
        .post("/sentiment", {
          message: this.state.inputmessage
        })
        .then(response => {
          if (response.data.status) {
            console.log(response);
          } else {
            risk = " ******* ";
          }
          this.deliverMessage(risk, channel, e);
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  }

  deliverMessage(resp, channel, e) {
    const testVar = resp + this.state.inputmessage + resp;
    this.setState({ inputmessage: testVar });
    channel.sendMessage(testVar);
    this.setState({ inputmessage: "" });
    this.scrollToBottom();
    e.preventDefault();
  }

  textChangeHandler(event) {
    this.setState({ inputmessage: event.target.value });
  }

  render() {
    const classes = this.props;
    const currentChannel = this.props.currentChannel;
    const currentUser = this.props.currentUser;
    if (currentChannel) {
      return (
        <div id="chat window">
          <Divider />
          <Scrollbars
            style={{ width: "100%", height: 650 }}
            ref={Scrollbars => {
              this.scrollbar = Scrollbars;
            }}
          >
            <div id="historymessages">
              {this.state.historyMessages.map(data => {
                if (data.author === currentUser) {
                  return (
                    <div>
                      <Typography
                        align="right"
                        color="primary"
                        type="display2"
                        font-size="10"
                      >
                        {data.body}
                      </Typography>
                      <Typography align="right" color="primary" type="caption">
                        {data.timestamp.toLocaleString()}
                      </Typography>
                    </div>
                  );
                } else {
                  return (
                    <div>
                      <Typography
                        align="left"
                        color="secondary"
                        type="display2"
                      >
                        {data.body}
                      </Typography>
                      <Typography align="left" color="secondary" type="caption">
                        {data.timestamp.toLocaleString()}
                      </Typography>
                    </div>
                  );
                }
              })}
            </div>
            <div id="newmessage">
              {this.state.newMessages.map(data => {
                if (data.author === currentUser) {
                  return (
                    <div>
                      <Typography align="right" color="primary" type="display2">
                        {data.body}
                      </Typography>
                      <Typography align="right" color="primary" type="caption">
                        {data.timestamp.toLocaleString()}
                      </Typography>
                    </div>
                  );
                } else {
                  return (
                    <div>
                      <Typography
                        align="left"
                        color="secondary"
                        type="display2"
                      >
                        {data.body}
                      </Typography>
                      <Typography align="left" color="secondary" type="caption">
                        {data.timestamp.toLocaleString()}
                      </Typography>
                    </div>
                  );
                }
              })}
            </div>
            <Divider />
          </Scrollbars>
          <div id="typewindow">
            <form
              id="type window form"
              className="chat-input"
              onSubmit={this.submitHandler}
            >
              <div id="type window container" className={classes.container}>
                <TextField
                  id="textarea"
                  label="Messages"
                  placeholder="Write a message..."
                  multiline
                  className={classes.textField}
                  onChange={this.textChangeHandler}
                  onKeyPress={this.handleEnterInput}
                  value={this.state.inputmessage}
                  margin="normal"
                />
                <Button color="primary" type="submit">
                  <Send />
                </Button>
              </div>
            </form>
          </div>
        </div>
      );
    } else {
      return (
        <Typography align="right" color="Error" type="caption">
          Select or create a channle to start;
        </Typography>
      );
    }
  }
}
export default withStyles(styles)(ChatWindow);
