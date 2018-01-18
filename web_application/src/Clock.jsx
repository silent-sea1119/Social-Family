//Source A
//State and Life Cycle
import Typography from "material-ui/Typography";
import React from 'react';
import { withStyles } from "material-ui/styles";
const styles = theme => ({
    chip: {
      alingn: "center",
      color:"primary",
      type:"headline"
    },
    
  });
class Clock extends React.Component{
    constructor(){
        super()
        this.state = {date: new Date()};
    }

    componentDidMount(){
        this.timerID = setInterval(
            ()=>this.tick(),1000);
    }

    componentWillUnmount(){
        clearInterval(this.timerID);
    }

    tick(){
        this.setState({date: new Date()})
    }

    render(){

        return(
              <Typography align="center" color = 'inherit' type ='title'>
                    {this.state.date.toLocaleString()}
            </Typography>   
        )
    }
};
export default withStyles(styles)(Clock)