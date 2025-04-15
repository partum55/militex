import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import CarFilters from './CarFilters';
import CarCard from './CarCard';

class CarList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cars: [],
      loading: true,
      error: '',
      filters: {},
      pagination: {
        count: 0,
        next: null,
        previous: null,
      },
      currentPage: 1
    };

    // To prevent multiple fetches
    this.isInitialFetchDone = false;
    this.isFetching = false;

    // Bind methods
    this.fetchCars = this.fetchCars.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handlePreviousPage = this.handlePreviousPage.bind(this);
    this.handleNextPage = this.handleNextPage.bind(this);
  }

  componentDidMount() {
    // Only fetch once when component mounts
    if (!this.isInitialFetchDone) {
      console.log('Initial car fetch');
      this.fetchCars();
      this.isInitialFetchDone = true;
    }
  }

  async fetchCars() {
    // Prevent multiple fetches
    if (this.isFetching) return;
    this.isFetching = true;

    this.setState({ loading: true });

    try {
      const { filters, currentPage } = this.state;

      // Build query params
      const params = new URLSearchParams();

      // Add page if not first page
      if (currentPage > 1) {
        params.append('page', currentPage);
      }

      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const queryString = params.toString();
      const url = queryString ? `/api/cars/?${queryString}` : '/api/cars/';

      console.log('Fetching cars from:', url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();

      this.setState({
        cars: data.results || [],
        pagination: {
          count: data.count || 0,
          next: data.next,
          previous: data.previous,
        },
        loading: false,
        error: ''
      });
    } catch (error) {
      console.error('Failed to fetch cars:', error);
      this.setState({
        error: `Failed to fetch cars: ${error.message}`,
        loading: false
      });
    } finally {
      this.isFetching = false;
    }
  }

  handleFilterChange(newFilters) {
    this.setState({
      filters: newFilters,
      currentPage: 1
    }, this.fetchCars); // Fetch cars after state update
  }

  handlePreviousPage() {
    const { pagination, currentPage } = this.state;
    if (pagination.previous && !this.isFetching) {
      this.setState({
        currentPage: currentPage - 1
      }, this.fetchCars); // Fetch cars after state update
    }
  }

  handleNextPage() {
    const { pagination, currentPage } = this.state;
    if (pagination.next && !this.isFetching) {
      this.setState({
        currentPage: currentPage + 1
      }, this.fetchCars); // Fetch cars after state update
    }
  }

  render() {
    const { t } = this.props;
    const { cars, loading, error, filters, pagination, currentPage } = this.state;

    return (
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Error!</p>
            <p>{error}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters */}
          <div className="w-full md:w-1/4">
            <CarFilters onFilterChange={this.handleFilterChange} />
          </div>

          {/* Car Listings */}
          <div className="w-full md:w-3/4">
            {/* Search Bar */}
            <div className="mb-6 flex">
              <input
                type="text"
                placeholder={t('common.search')}
                className="w-full px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => {
                  clearTimeout(this.searchTimeout);
                  const searchTerm = e.target.value;

                  this.searchTimeout = setTimeout(() => {
                    this.handleFilterChange({ ...filters, search: searchTerm });
                  }, 500);
                }}
              />
              <button className="bg-indigo-900 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
            </div>

            {/* Cars Grid */}
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="loader"></div>
              </div>
            ) : cars.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No cars found matching your criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.count > 0 && (
              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={this.handlePreviousPage}
                  disabled={!pagination.previous || this.isFetching}
                  className={`px-4 py-2 rounded ${
                    pagination.previous && !this.isFetching ? 'bg-indigo-900 text-white hover:bg-indigo-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {t('common.previous')}
                </button>

                <span className="text-gray-600">
                  Page {currentPage} of {Math.ceil(pagination.count / 10)}
                </span>

                <button
                  onClick={this.handleNextPage}
                  disabled={!pagination.next || this.isFetching}
                  className={`px-4 py-2 rounded ${
                    pagination.next && !this.isFetching ? 'bg-indigo-900 text-white hover:bg-indigo-800' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {t('common.next')}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default withTranslation()(CarList);
