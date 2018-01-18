//Source A
import React from "react";
import Form from "react-validation/build/form";
import Input from "react-validation/build/input";
import Button from "react-validation/build/button";

const axios = require("axios");

class PinWindow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pin: ""
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  handleSubmit(e) {
    console.log(this.state.pin);
    axios
      .post("/pin", {
        pin: this.state.pin
      })
      .catch(function(error) {
        console.log(error);
      });
    console.log("handleSubmit called");
  }

  handleFormSubmit() {
    this.props.changeLoginStatus();
    this.handleSubmit();
    console.log("handleFormSubmit called");
  }

  handleChange(e) {
    this.setState({ pin: e.target.value });
  }

  render() {
    const lt = value => {
      // get the maxLength from component's props
      if (value.toString().trim().length > 4) {
        // Return jsx
        return <div className="error">The PIN exceeded 4 digits!</div>;
      }
    };

    const passwords = (value, props, components) => {
      console.log("The first PIN is: " + components["password"][0].value);
      console.log(
        "The second PIN is: " + components["repeatPassword"][0].value
      );
      let pin1 = components["password"][0].value;
      let pin2 = components["repeatPassword"][0].value;

      if (isNaN(pin1) || isNaN(pin2)) {
        return <div className="error">Only digits allowed!</div>;
      }

      if (pin1 !== pin2) {
        return <div className="error">PINs are not equal!</div>;
      }
    };

    return (
      <Form>
        <h3>Please come up with a 4-digit PIN</h3>
        <Input
          type="password"
          name="password"
          placeholder="Password"
          validations={[lt]}
        />
        <Input
          type="password"
          name="repeatPassword"
          placeholder="Repeat password"
          onChange={this.handleChange}
          validations={[lt, passwords]}
        />
        <Button onClick={this.handleFormSubmit}>Submit</Button>
      </Form>
    );
  }
}

export default PinWindow;
