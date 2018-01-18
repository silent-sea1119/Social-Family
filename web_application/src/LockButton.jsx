//Source A
import React, { Component } from "react";
import "./LockButton.css";
import Button from "material-ui/Button";
// import Input from "react-validation/build/input";

const axios = require("axios");

class LockButton extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLocked: false
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleEnter = this.handleEnter.bind(this);
  }

  handleClick() {
    let isLocked = !this.state.isLocked;
    if (isLocked) {
      console.log("I'm going to change state to " + isLocked);
      this.setState({ isLocked }, () => {
        this.props.changeStatus(this.state.isLocked);
      });
    } else {
      const inputPin = document.getElementById("PIN").value;
      console.log("*****InputPin is " + inputPin);
      // make a request to compare pins
      axios
        .post("/checkpin", {
          pin: inputPin
        })
        .then(response => {
          if (!response.data.valid) {
            console.log(response);
          } else {
            const correctPin = response.data.valid;
            console.log("POST RESPONSE IS " + correctPin);
            if (correctPin) {
              console.log('I"m inside if and want to return ' + correctPin);
              this.setState({ isLocked }, () => {
                this.props.changeStatus(this.state.isLocked);
              });
            }
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  }

  handleEnter(event) {
    if (event.which === 13) {
      let isLocked = !this.state.isLocked;
      const inputPin = document.getElementById("PIN").value;
      console.log("**** is " + inputPin);
      // make a request to compare pins
      axios
        .post("/checkpin", {
          pin: inputPin
        })
        .then(response => {
          if (!response.data.valid) {
            console.log(response);
          } else {
            const correctPin = response.data.valid;
            console.log("POST RESPONSE IS " + correctPin);
            if (correctPin) {
              console.log('I"m inside if and want to return ' + correctPin);
              this.setState({ isLocked }, () => {
                this.props.changeStatus(this.state.isLocked);
              });
            }
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  }

  render() {
    const isLocked = this.state.isLocked;

    return isLocked ? (
      <div className="finalDiv">
        <Button type="submit" className="locked" onClick={this.handleClick} />
        <input
          type="password"
          id="PIN"
          placeholder="PIN"
          maxlength="4"
          onKeyPress={this.handleEnter}
        />
      </div>
    ) : (
      <div className="finalDiv">
        <Button type="submit" className="unlocked" onClick={this.handleClick} />
      </div>
    );
  }
}

export default LockButton;
