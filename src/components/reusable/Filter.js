import React from "react";
import "@fortawesome/fontawesome-free/css/all.css";

export default class Filter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showMenu: false,
      vectorIcon: "fa-angle-down",
      menuDisplay: "filter-menu-hidden",
      tabContainer: "tab-container",
      tab: "tab",
      tabItem: "tab-item"
    };
    this.toggleMenu = this.toggleMenu.bind(this);
  }

  toggleMenu() {
    if (this.state.showMenu) {
      this.setState({
        vectorIcon: "fa-angle-down",
        menuDisplay: "filter-menu-hidden",
        tabContainer: "tab-container",
        tab: "tab",
        tabItem: "tab-item",

        showMenu: false
      });
    } else {
      this.setState({
        vectorIcon: "fa-angle-up",
        menuDisplay: "filter-menu",
        tabContainer: "tab-container-active",
        tab: "tab",
        tabItem: "tab-item-active",
        showMenu: true
      });
    }
  }

  render() {
    const { tabContainer, tab, tabItem, vectorIcon, menuDisplay } = this.state;
    return (
      <>
        <div className="row">
          <div id={tabContainer} className="col-6 offset-3 pl-0">
            <div id={tab}>
              <div
                id={tabItem}
                className="d-inline-block cursor-pointer-on-hover"
                onClick={this.toggleMenu}
              >
                <p id="filter-text" className="ml-1 d-inline mr-2 no-select">
                  Filters
                </p>
                <i className={`fas ${vectorIcon}`}></i>
              </div>
            </div>
          </div>
        </div>
        <div className={`row position-absolute w-100 ${menuDisplay}`}>
          <div className="col-6 offset-3 large-z-index bg-white">
            <div id="tabContent" className="row p-1">
              <FilterOptions
                filters={this.props.filters}
                clickHandler={this.props.toggleFilterClicked}
              />
              {this.props.children}
            </div>
          </div>
        </div>
      </>
    );
  }
}

const FilterOptions = ({ filters, clickHandler }) => {
  return Object.entries(filters).map(([rawCategory, { list, title }]) => {
    return (
      <div key={title} className="col">
        <div>
          <div>
            <p>{title}:</p>
          </div>
          <div>
            <ul className="list-unstyled">
              <FilterOption
                options={list}
                rawCategory={rawCategory}
                clickHandler={clickHandler}
              />
            </ul>
          </div>
        </div>
      </div>
    );
  });
};

const FilterOption = ({ options, rawCategory, clickHandler }) => {
  return options.map(({ name, id }) => {
    // if (rawCategory === "films") {
    //   return (
    //     <li key={id}>
    //       <div className="form-check abc-checkbox abc-checkbox-primary">
    //         <input
    //           id={id}
    //           type="checkbox"
    //           onClick={() => clickHandler(rawCategory, name, id)}
    //         />
    //         <label htmlFor={id}>{name}</label>
    //       </div>
    //     </li>
    //   );
    // } else {
    return (
      <li key={id}>
        <div className="form-check abc-checkbox abc-checkbox-primary">
          <input
            id={id}
            type="checkbox"
            onClick={() => clickHandler(rawCategory, name)}
          />
          <label htmlFor={id}>{name}</label>
        </div>
      </li>
    );
    //}
  });
};
