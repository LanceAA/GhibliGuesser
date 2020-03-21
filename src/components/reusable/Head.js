import React from "react";
import { Link } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.css";

export const Head = ({
  title,
  search,
  updateSearch,
  toggleFilterClicked,
  filters,
  children,
  img
}) => {
  return (
    <div id="head" className="position-relative">
      <Header title={title} />
      <Searchbar search={search} onChangeHandler={updateSearch} />
      <Filter filters={filters} toggleFilterClicked={toggleFilterClicked}>
        {children}
      </Filter>
      <img className="head-img" src={img} />
    </div>
  );
};

class Filter extends React.Component {
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
      <div className="pb-3 theme-dark-bg faux-row-margin position-relative">
        <div className="row w-100">
          <div id={tabContainer} className="col-6 offset-3 pl-0">
            <div id={tab}>
              <div
                id={tabItem}
                className="d-inline-block cursor-pointer-on-hover theme-dark-color"
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
          <div className="col-6 offset-3 large-z-index theme-dark-bg">
            <div id="tabContent" className="row p-1">
              <FilterOptions
                filters={this.props.filters}
                clickHandler={this.props.toggleFilterClicked}
              />
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const FilterOptions = ({ filters, clickHandler }) => {
  return Object.entries(filters).map(([rawCategory, { list, title }]) => {
    return (
      <div key={title} className="col">
        <div>
          <div>
            <p className="theme-dark-color">{title}:</p>
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
    return (
      <li key={id}>
        <div className="form-check abc-checkbox abc-checkbox-primary">
          <input
            id={id}
            type="checkbox"
            onClick={() => clickHandler(rawCategory, name)}
          />
          <label htmlFor={id} className="theme-dark-color">
            {name}
          </label>
        </div>
      </li>
    );
  });
};

const Searchbar = ({ search, onChangeHandler }) => {
  return (
    <>
      <div className="row pb-3 theme-dark-bg">
        <div className="col-6 offset-3">
          <input
            id="searchbar"
            type="text"
            className="form-control"
            placeholder="Search..."
            value={search}
            onChange={onChangeHandler}
          />
        </div>
      </div>
    </>
  );
};

const Header = ({ title }) => {
  return (
    <>
      <div className="row pb-4 theme-dark-bg">
        <div className="col-1">
          <Link className="mt-3 btn btn-outline-theme-dark" to="/">
            Home
          </Link>
        </div>
        <div className="col offset-1 mt-3 mb-4">
          <h1 id="search-title" className="theme-dark-color">
            {title}
          </h1>
        </div>
      </div>
    </>
  );
};
