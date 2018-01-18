//Source A
import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "material-ui/styles";
import Avatar from "material-ui/Avatar";
import Typography from "material-ui/Typography";

const styles = {
  avatar: {
    margin: 10
  },
  column: {
    display: "flex"
  }
};

class PersonInfoAvatars extends React.Component {
  render() {
    const personInfo = this.props;
    return (
      <div id="user info container" className={personInfo.column}>
        <Avatar className={personInfo.avatar} src={personInfo.picture} />
        <Typography type="subheading">{personInfo.email}</Typography>
        <Typography type="subheading">{personInfo.name}</Typography>
      </div>
    );
  }
}
PersonInfoAvatars.PropTypes = {
  classes: PropTypes.object.isRequired
};
export default withStyles(styles)(PersonInfoAvatars);
