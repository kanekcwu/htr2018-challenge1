import React from 'react';

import {
  Table,
  Button, ButtonToolbar, ButtonGroup,
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';
import currencyFormatter from 'currency-formatter';

import { Icon } from 'react-icons-kit';
import {
  ic_remove_circle_outline as removeCircle,
  ic_keyboard_arrow_up as arrowUp,
  ic_keyboard_arrow_down as arrowDown,
} from 'react-icons-kit/md';

export default class Promotions extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      columns: [
        'Item',
        'Category',
        'Promotion Type',
        'Promotion Description',
        'Start Date',
        'End Date',
        'Duration',
        'Quantity',
        'Total Sales',
        'Average Daily Profit Change',
      ],
      limit: 20,
      sortBy: 'Category',
      sortAscending: true,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      fetch(`${process.env.REACT_APP_DRILLER_API_ENDPOINT_PREFIX}promotions/filters`)
      .then(response => response.json())
      .then((data) => {
        this.setState({
          filters: data.filters,
          activeFilters: Object.keys(data.filters).reduce((memo, item) => ({
            ...memo,
            [item]: null,
          }), {}),
          isFilterOpen: Object.keys(data.filters).reduce((memo, item) => ({
            ...memo,
            [item]: false,
          }), {}),
        });
      });
    }, 0);
    this.fetchTableData();
  }

  toggleSort(sortBy) {
    if (sortBy === this.state.sortBy) {
      this.setState({
        sortAscending: !this.state.sortAscending,
      });
    } else {
      this.setState({
        sortBy,
      });
    }
    this.fetchTableData();
  }

  toggleFilter(filter) {
    this.setState({
      isFilterOpen: {
        ...this.state.isFilterOpen,
        [filter]: !this.state.isFilterOpen[filter],
      },
    });
  }

  setFilter(filter, name) {
    this.setState({
      activeFilters: {
        ...this.state.activeFilters,
        [filter]: name,
      },
    });
    this.fetchTableData();
  }

  fetchTableData() {
    setTimeout(() => {
      fetch(`${process.env.REACT_APP_DRILLER_API_ENDPOINT_PREFIX}promotions`, {
        method: 'post',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          offset: 0,
          limit: this.state.limit,
          sortBy: this.state.sortBy,
          sortAscending: this.state.sortAscending,
          filters: this.state.activeFilters || {},
        }),
      })
      .then(response => response.json())
      .then((data) => {
        this.setState({ records: data.promotions });
      });
    }, 0);
  }

  render() {
    return <div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h2>Promotions</h2>
      </div>
      <div className="d-flex justify-content-start flex-wrap flex-md-nowrap align-items-left pb-1 mb-2">
        <h4>Filters</h4>
        <ButtonToolbar>
          {
            this.state.filters && (
              Object.keys(this.state.filters).map((filter) => (
                <Dropdown className="px-2" isOpen={this.state.isFilterOpen[filter]} toggle={() => this.toggleFilter(filter)} size="sm" color="primary">
                  <DropdownToggle caret>{filter}: {this.state.activeFilters[filter] || '[all]'}</DropdownToggle>
                  <DropdownMenu left>
                    <DropdownItem header>{filter}</DropdownItem>
                    {
                      this.state.activeFilters[filter] && (
                        <DropdownItem onClick={() => this.setFilter(filter, null)} disabled={!this.state.activeFilters[filter]}>
                          <Icon icon={removeCircle} /> Remove this filter
                        </DropdownItem>
                      )
                    }
                    {this.state.filters[filter].map(item => (
                      <DropdownItem onClick={() => this.setFilter(filter, item)}>{item}</DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>
              ))
            )
          }
        </ButtonToolbar>
      </div>
      <Table responsive hover>
        <thead>
          <tr>
            {
              this.state.columns.map(column => (
                <th onClick={() => this.toggleSort(column)}>
                  {column}
                  {
                    (this.state.sortBy === column) && <Icon icon={this.state.sortAscending ? arrowUp : arrowDown} />
                  }
                </th>
              ))
            }
          </tr>
        </thead>
        <tbody>
          {
            this.state.records && this.state.records.map(record => (
              <tr>
                {
                  this.state.columns.map((column) => {
                    if ([
                      'Total Sales',
                    ].includes(column)) {
                      return <td>{currencyFormatter.format(record[column], { code: 'HKD' })}</td>;
                    }

                    if ([
                      'Quantity',
                    ].includes(column)) {
                      return <td>{currencyFormatter.format(record[column], {
                        thousands: ',',
                        precision: 0,
                      })}</td>;
                    }

                    return <td>{record[column]}</td>;
                  })
                }
              </tr>
            ))
          }
          {
            !this.state.records && <tr><td colspan={this.state.columns.length}>Loading&hellip;</td></tr>
          }
        </tbody>
        <tfoot>
        </tfoot>
      </Table>
    </div>;
  }
}
