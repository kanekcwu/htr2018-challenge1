import React from 'react';

import { Table } from 'reactstrap';

export default class Promotions extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      limit: 20,
      sortBy: 'Prom Start',
      sortAscending: true,
    };
  }

  componentDidMount() {
    this.fetchData();
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
    this.fetchData();
  }

  fetchData() {
    this.setState({ records: null });

    setTimeout(() => {
      fetch(`${process.env.REACT_APP_DRILLER_API_ENDPOINT_PREFIX}promotions?limit=${this.state.limit}&sortBy=${this.state.sortBy}&sortAscending=${this.state.sortAscending ? 1 : 0}`)
      .then(response => response.json())
      .then((data) => {
        this.setState({ records: data.promotions });
      });
    }, 0);
  }

  render() {
    return <div>
      <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
        <h1 className="h2">Promotions</h1>
        <div className="btn-toolbar mb-2 mb-md-0">
          <div className="btn-group mr-2">
            <button className="btn btn-sm btn-outline-secondary">Import</button>
          </div>
          <button disabled className="btn btn-sm btn-outline-secondary dropdown-toggle">
            Apr 2018
          </button>
        </div>
      </div>
      {
        this.state.records && (
          <Table responsive hover size="sm">
            <thead>
              <tr>
                <th onClick={() => this.toggleSort('Prod Name (Chi)')}>
                  Product
                  {
                    (this.state.sortBy === 'Prod Name (Chi)') && (this.state.sortAscending ? '\u25b2' : '\u25bc')
                  }
                </th>
                <th onClick={() => this.toggleSort('Prom Start')}>
                  Start Date
                  {
                    (this.state.sortBy === 'Prom Start') && (this.state.sortAscending ? '\u25b2' : '\u25bc')
                  }
                </th>
                <th onClick={() => this.toggleSort('Prom End')}>
                  End Date
                  {
                    (this.state.sortBy === 'Prom End') && (this.state.sortAscending ? '\u25b2' : '\u25bc')
                  }
                </th>
              </tr>
            </thead>
            <tbody>
              {
                this.state.records.map(record => (
                  <tr>
                    <td>{record['Prod Name (Chi)']}</td>
                    <td>{record['Prom Start']}</td>
                    <td>{record['Prom End']}</td>
                  </tr>
                ))
              }
            </tbody>
            <tfoot>
            </tfoot>
          </Table>
        )
      }
      {
        !this.state.records && <div>Loading...</div>
      }
    </div>;
  }
}
