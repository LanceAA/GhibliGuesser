import React from "react";

export default class Table extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showDetails: false,
      chevronClicked: "fa-chevron-down",
      borderRules: "border-top",
      detailContainer: "detail-container-hidden"
    };
    this.toggleShowDetails = this.toggleShowDetails.bind(this);
    this.startAnimation = this.startAnimation.bind(this);
  }

  startAnimation() {
    this.setState({
      showDetails: true,
      chevronClicked: "fa-chevron-up",
      borderRules: "border-fading-top",
      detailContainer: "detail-container border-fading-bottom"
    });
  }

  toggleShowDetails() {
    if (this.state.showDetails) {
      this.setState({
        showDetails: false,
        chevronClicked: "fa-chevron-down",
        borderRules: "border-top",
        detailContainer: "detail-container-hidden"
      });
    } else {
      this.setState({
        showDetails: true,
        chevronClicked: "fa-chevron-up",
        borderRules: "border-top",
        detailContainer: "detail-container"
      });
    }
  }
}
