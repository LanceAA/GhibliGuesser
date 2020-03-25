import React from "react";
import { Link } from "react-router-dom";
import "@fortawesome/fontawesome-free/css/all.css";

export default class Head extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showMenu: false,
      showDropdownNav: false,
      vectorIcon: "fa-angle-down",
      menuDisplay: "filter-menu-hidden",
      filterBtn: "filter-btn",
      dropdownStatus: "fade-out dropdown-menu-hidden",
      titleVectorIcon: "fa-angle-down",
      titleContainer: "title-container"
    };
    this.toggleMenu = this.toggleMenu.bind(this);
    this.toggleDropdownNav = this.toggleDropdownNav.bind(this);
  }

  toggleDropdownNav() {
    if (this.state.showDropdownNav) {
      this.setState({
        showDropdownNav: false,
        dropdownStatus: "fade-out dropdown-menu-hidden",
        titleVectorIcon: "fa-angle-down",
        titleContainer: "title-container"
      });
    } else {
      this.setState({
        showDropdownNav: true,
        dropdownStatus: "fade-in dropdown-menu-active",
        titleVectorIcon: "fa-angle-up",
        titleContainer: "title-container-active"
      });
    }
  }

  toggleMenu() {
    if (this.state.showMenu) {
      this.setState({
        showMenu: false,
        vectorIcon: "fa-angle-down",
        menuDisplay: "filter-menu-hidden",
        filterBtn: "filter-btn"
      });
    } else {
      this.setState({
        showMenu: true,
        vectorIcon: "fa-angle-up",
        menuDisplay: "filter-menu",
        filterBtn: "filter-btn-active"
      });
    }
  }

  render() {
    const {
      title,
      search,
      updateSearch,
      toggleFilterClicked,
      filters,
      children,
      img,
      titleDropdownAry
    } = this.props;
    const {
      vectorIcon,
      menuDisplay,
      filterBtn,
      dropdownStatus,
      titleVectorIcon,
      titleContainer
    } = this.state;
    console.log(this.props);

    return (
      <div id="head" className="position-relative">
        <div className="row theme-dark-bg">
          <div className="col-sm-auto">
            <Link
              className="mt-3 btn btn-outline-theme-dark border-0"
              id="home-link"
              to="/"
            >
              <i className="fas fa-home d-inline pr-2"></i>
              <p className="d-inline">Home</p>
            </Link>
          </div>
        </div>
        <div className="row theme-dark-bg justify-content-center pb-5">
          <div
            className={`col-sm-auto position-relative cursor-pointer-on-hover pb-2 ${titleContainer}`}
            onClick={this.toggleDropdownNav}
          >
            {/* <div
              className="cursor-pointer-on-hover"
              onClick={this.toggleDropdownNav}
            > */}
            <h1 id="search-title" className="theme-dark-color d-inline mr-3">
              {title}
            </h1>
            <i
              id="title-vector"
              className={`fas ${titleVectorIcon} d-inline theme-dark-color d-inline`}
            ></i>
            {/* </div> */}
            <div className={`dropdown-menu ${dropdownStatus} d-block m-0 pt-2`}>
              <DropdownItems ary={titleDropdownAry} />
            </div>
          </div>
          <div className="col-6 position-relative d-flex">
            <input
              id="searchbar"
              type="text"
              className="form-control flex-grow-1 mr-3 d-flex align-self-center"
              placeholder="Search..."
              value={search}
              onChange={updateSearch}
            />
            <div className="d-flex align-self-center">
              <div
                id={filterBtn}
                className="d-inline-block cursor-pointer-on-hover theme-dark-color"
                onClick={this.toggleMenu}
              >
                <p id="filter-text" className="ml-1 d-inline mr-2 no-select">
                  Filters
                </p>
                <i className={`fas ${vectorIcon} d-inline`}></i>
              </div>
            </div>
            <div
              className={`theme-dark-bg ${menuDisplay} d-flex justify-content-between position-absolute`}
            >
              <FilterOptions
                filters={filters}
                clickHandler={toggleFilterClicked}
              />
              {children}
            </div>
          </div>
        </div>
        <img className="head-img" src={img} />
      </div>
    );
  }
}

const DropdownItems = ({ ary }) => {
  return ary.map(item => {
    const { name, path } = item;
    return (
      <Link key={name} className="dropdown-item" to={path}>
        {name}
      </Link>
    );
  });
};

const FilterOptions = ({ filters, clickHandler }) => {
  return Object.entries(filters).map(([rawCategory, { list, title }]) => {
    return (
      <div key={title} className="pl-3 pr-3 bg-inherit">
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
        <div className="abc-checkbox abc-checkbox-primary">
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
