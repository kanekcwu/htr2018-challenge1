import React, { Component } from 'react';
import './App.css';

import {
  Button, ButtonToolbar, Table,
  Nav, NavLink, NavItem,
  UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';

import Overview from './pages/Overview';
import Promotions from './pages/Promotions';

function rand(min, max, num) {
  var rtn = [];
  while (rtn.length < num) {
    rtn.push((Math.random() * (max - min)) + min);
  }
  return rtn;
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mode: 'promotions',
    };
  }

  render() {
    return (
      <div className="App">
        <Nav horizontal className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="#">D</a>
          <ul class="navbar-nav px-3">
            <li class="nav-item text-nowrap">
              <ButtonToolbar>
                <UncontrolledDropdown disabled size="sm" color="primary">
                  <DropdownToggle caret>Apr 2018</DropdownToggle>
                  <DropdownMenu right>
                    <DropdownItem header>Month</DropdownItem>
                    <DropdownItem>Apr 2018</DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </ButtonToolbar>
            </li>
          </ul>
        </Nav>

        <div className="container-fluid">
          <div className="row">
            <Nav vertical className="col-md-2 d-none d-md-block bg-light sidebar">
              <div className="sidebar-sticky">
                <NavItem>
                  <NavLink
                    href="#overview"
                    active={this.state.mode === 'overview'}
                    onClick={() => {this.setState({ mode: 'overview' })}}
                  >Overview</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="#promotions"
                    active={this.state.mode === 'promotions'}
                    onClick={() => {this.setState({ mode: 'promotions' })}}
                  >Promotions</NavLink>
                </NavItem>
              </div>
            </Nav>

            <main role="main" className="col-md-9 ml-sm-auto col-lg-10 px-4">
              {
                this.state.mode === 'overview' && <Overview />
              }
              {
                this.state.mode === 'promotions' && <Promotions />
              }
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
