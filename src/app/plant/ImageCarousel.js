import React from "react";
import Carousel from "react-material-ui-carousel";
import autoBind from "auto-bind";
import Banner from './Banner.js';

const items = [
  {
    Name: "Climate Impact",
    Caption: "2022",
    contentPosition: "left",
    Items: [
      {
        Name: "145 Tons CO2 Removed",
        Image: "https://source.unsplash.com/featured/?factory"
      },
      {
        Name: "1,743 Trees Planted",
        Image: "https://source.unsplash.com/featured/?planting"
      }
    ]
  },
  {
    Name: "City Canopy",
    Caption: "36% coverage",
    contentPosition: "middle",
    Items: [
      {
        Name: "+4% Since 2020",
        Image: "https://source.unsplash.com/featured/?garden"
      },
      {
        Name: "Ozone Restoration",
        Image: "https://source.unsplash.com/featured/?traffic"
      }
    ]
  },
  {
    Name: "Volunteering",
    Caption: "Earth Day",
    contentPosition: "right",
    Items: [
      {
        Name: "Earth Day 2022",
        Image: "https://source.unsplash.com/featured/?whale"
      },
      {
        Name: "Plant-a-thon 2022",
        Image: "https://source.unsplash.com/featured/?marathon"
      }
    ]
  }
];

class ImageCarousel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      autoPlay: true,
      animation: "fade",
      indicators: true,
      timeout: 500,
      navButtonsAlwaysVisible: false,
      navButtonsAlwaysInvisible: false,
      cycleNavigation: true
    };

    autoBind(this);
  }

  toggleAutoPlay() {
    this.setState({
      autoPlay: !this.state.autoPlay
    });
  }

  toggleIndicators() {
    this.setState({
      indicators: !this.state.indicators
    });
  }

  toggleNavButtonsAlwaysVisible() {
    this.setState({
      navButtonsAlwaysVisible: !this.state.navButtonsAlwaysVisible
    });
  }

  toggleNavButtonsAlwaysInvisible() {
    this.setState({
      navButtonsAlwaysInvisible: !this.state.navButtonsAlwaysInvisible
    });
  }

  toggleCycleNavigation() {
    this.setState({
      cycleNavigation: !this.state.cycleNavigation
    });
  }

  changeAnimation(event) {
    this.setState({
      animation: event.target.value
    });
  }

  changeTimeout(event, value) {
    this.setState({
      timeout: value
    });
  }

  render() {
    return (
      <div style={{ marginTop: "50px", color: "#494949" }}>
        <Carousel
          className="Example"
          autoPlay={this.state.autoPlay}
          animation={this.state.animation}
          indicators={this.state.indicators}
          timeout={this.state.timeout}
          cycleNavigation={this.state.cycleNavigation}
          navButtonsAlwaysVisible={this.state.navButtonsAlwaysVisible}
          navButtonsAlwaysInvisible={this.state.navButtonsAlwaysInvisible}
          next={(now, previous) =>
            console.log(
              `Next User Callback: Now displaying child${now}. Previously displayed child${previous}`
            )
          }
          prev={(now, previous) =>
            console.log(
              `Prev User Callback: Now displaying child${now}. Previously displayed child${previous}`
            )
          }
          onChange={(now, previous) =>
            console.log(
              `OnChange User Callback: Now displaying child${now}. Previously displayed child${previous}`
            )
          }
          // fullHeightHover={false}
          // navButtonsProps={{style: {backgroundColor: 'cornflowerblue', borderRadius: 0}}}
          // navButtonsWrapperProps={{style: {bottom: '0', top: 'unset', }}}
          // indicatorContainerProps={{style: {margin: "20px"}}}
          // NextIcon='next'
        >
          {items.map((item, index) => {
            return (
              <Banner
                item={item}
                key={index}
                contentPosition={item.contentPosition}
              />
            );
          })}
        </Carousel>
      </div>
    );
  }
}

export default ImageCarousel;
